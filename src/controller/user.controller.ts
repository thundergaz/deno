import type { RouterContext } from "../deps.ts";
import { users } from "./auth.controller.ts";
import { client, query } from "../database/db.ts";

const getMeController = ({ state, response }: RouterContext<string>) => {
  try {
    const user = users.find((user) => user.id === state.user_id);

    response.status = 200;
    response.body = {
      status: "success",
      user,
    };
  } catch (error) {
    response.status = 500;
    response.body = {
      status: "success",
      message: error.message,
    };
    return;
  }
};

const userListController = async ({ state, response }: RouterContext<string>) => {
  const result = await client
  .query(
    // query.Paginate(query.Match(query.Index("allUsers"))) 这样回来的是一个引用的数据，没有具体信息
    query.Map(
      query.Paginate(query.Match(query.Index("allUsers"))),
      query.Lambda('userRef', 
        //query.Get(query.Var('pilotRef')), 这样虽然有数据，但是会把 数据 引用 ts 一起返回 结构比较乱
        query.Let(
          {
            shipDoc: query.Get(query.Var("userRef"))
          },
          {
            id: query.Select(["ref", "id"], query.Var("shipDoc")),
            name: query.Select(["data", "name"], query.Var("shipDoc")),
            position: query.Select(["data", "code"], query.Var("shipDoc")),
            activeDevice: query.Select(["data", "activeDevice"], query.Var("shipDoc")),
          }
        )
      )
    )
  )
  .then((ret) => {
    return {
      ...ret,
      success: true
    }
  })
  .catch((err) => {
    return {
      ...err,
      success: true
    }
  });
  if (result.success) {
    response.status = 200;
  } else {
    response.status = 500;
  }
  response.body = result;
};

export default { getMeController, userListController };