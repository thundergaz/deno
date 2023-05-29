import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";

const createPrizeController = async ({ request, response }: RouterContext<string>) => {
  // 奖品 # 标题 title 图片 picUrl 消耗的积分 score 心愿是否怩完成 finish # 创建日期 createdAt # 内容 content 积分属于 userName
  const { title, picUrl, score, userName, createdAt, id, finish, content } = await request.body().value;
  if ((!id && title && score && userName) || (id && title && score && finish && createdAt && userName)) {
    const result = await queryResult(
      !id ? (
        query.Create(query.Collection("prize"), {
          data: {
            title, picUrl, score ,content, userName,
            createdAt: new Date().toLocaleString(),
          }
        }
        )
      ) : (
        query.Update(query.Ref(query.Collection("prize"), id), {
          data: {
            title, picUrl, content, score, finish, userName,
            createdAt,
            updatedAt: new Date().toLocaleString()
          }
        })
      )
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

const PrizeListController = async ({ state, request ,response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request });
  const userName = queryData.name;
  const result = await queryResult(
    query.Map(
      query.Paginate(query.Match(query.Index("prize_list"), userName)),
      query.Lambda(['time', 'prizeRef'],
        query.Let(
          {
            shipDoc: query.Get(query.Var("prizeRef"))
          },
          {
            id: query.Select(["ref", "id"], query.Var("shipDoc")),
            title: query.Select(["data", "title"], query.Var("shipDoc")),
            score: query.Select(["data", "score"], query.Var("shipDoc")),
            content: query.Select(["data", "content"], query.Var("shipDoc")),
            picUrl: query.Select(["data", "picUrl"], query.Var("shipDoc")),
            finish: query.Select(["data", "finish"], query.Var("shipDoc")),
            createdAt: query.Select(["data", "createdAt"], query.Var("shipDoc")),
          }
        )
      )
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

export default { createPrizeController, PrizeListController };