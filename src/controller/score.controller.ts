import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";

const createScoreController = async ({ request, response }: RouterContext<string>) => {
  // 日期 date 积分数 score 描述 description
  const { date, score, description, userName } = await request.body().value;
  if (date && score && description && userName) {
    const result = await queryResult(
      query.Create(query.Collection("score"), {
        data: {
          date, score, description, userName
        }
      })
    );
    response.status = result.success ? 200 : 500;
    response.body = result;
  } else {
    response.status = 500;
    response.body = {
      msg: '必要的数据未提交'
    };
  }
};
// 积分列表
const scoreListController = async ({ state, request, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request });
  const { userName } = queryData;
  const result = await queryResult(
    query.Map(
      query.Paginate(query.Match(query.Index("score_list"), userName)),
      query.Lambda(['time', 'prizeRef'], query.Let(
        {
          shipDoc: query.Get(query.Var("prizeRef"))
        },
        {
          id: query.Select(["ref", "id"], query.Var("shipDoc")),
          raw: query.Select(["data"], query.Var("shipDoc"))
        }
      ))
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

export default { scoreListController, createScoreController };