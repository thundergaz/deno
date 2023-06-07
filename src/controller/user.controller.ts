import { RouterContext, helpers } from "../deps.ts";
import { users } from "./auth.controller.ts";
import { queryResult, query } from "../database/db.ts";
import { updateUserScore } from "./tools.ts"

// 获取当前用户
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
// 获取用户信息
const getUserController = async ({ state, request, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request });
  const userName = queryData.name;
  const result = await queryResult(
    query.Let(
      {
        resData1: query.Get(query.Select([0], query.Paginate(query.Match(query.Index("user_by_name"), userName))))
      },
      {
        data: query.Merge( 
          { id: query.Select(["ref", "id"], query.Var("resData1")) },
          query.Select(['data'], query.Var('resData1'))
        )
      }
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
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

export default { getMeController, userListController, getUserController };