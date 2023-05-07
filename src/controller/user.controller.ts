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

const testController = async ({ state, response }: RouterContext<string>) => {
  const result = await client
  .query(
    query.Create(query.Collection("Project"), {
      data: {
        name: 'ttttt22233',
      },
    })
  )
  .then((ret) => {
    return {
      data: ret,
      success: true
    }
  })
  .catch((err) => {
    return {
      error: err,
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

export default { getMeController, testController };