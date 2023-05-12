import type { RouterContext } from "../deps.ts";
import { users } from "./auth.controller.ts";
import { queryResult, query } from "../database/db.ts";

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
// 获取用户列表
const userListController = async ({ state, response }: RouterContext<string>) => {
  const result = await queryResult(
    query.Map(
      query.Paginate(query.Match(query.Index("allUsers"))),
      query.Lambda('userRef',
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
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

export default { getMeController, userListController };