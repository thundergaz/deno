import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";

const addScoreController = async ({ request, response }: RouterContext<string>) => {
  const { item, date, id } = await request.body().value;
  const result = await queryResult('Collection', 'mxyz',
    !id ? (
      query.Create(query.Collection("mxyz"), {
        data: {
          // 加分项
          item,
          // 加分的时间
          date
        }
      }
      )
    ) : (
      query.Update(query.Ref(query.Collection("mxyz"), id), {
        data: {
          // 加分项
          item,
          // 加分的时间
          date
        }
      })
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

const scoreListController = async ({ state, response }: RouterContext<string>) => {
  const result = await queryResult("Index", "mxyz_all_score",
    query.Map(
      query.Paginate(query.Match(query.Index("mxyz_all_score"))),
      query.Lambda('scoreRef',
        query.Let(
          {
            shipDoc: query.Get(query.Var("scoreRef"))
          },
          {
            id: query.Select(["ref", "id"], query.Var("shipDoc")),
            item: query.Select(["data", "item"], query.Var("shipDoc")),
            date: query.Select(["data", "date"], query.Var("shipDoc")),
          }
        )
      )
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};
// 查找某天的内容，用于更新
const getContentController = async ({ state, request, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request });
  const searchDate = queryData.date;
  const result = await queryResult("Index", "mxyz_all_score",
    query.Map(
      query.Filter(
        query.Paginate(query.Match(query.Index("mxyz_all_score"))),
        query.Lambda(
          "planetRef",
          query.ContainsStr(
            query.Select(["data", "date"], query.Get(query.Var("planetRef"))),
            searchDate
          )
        )
      ),
      query.Lambda("scoreRef", query.Let(
        {
          shipDoc: query.Get(query.Var("scoreRef"))
        },
        {
          id: query.Select(["ref", "id"], query.Var("shipDoc")),
          item: query.Select(["data", "item"], query.Var("shipDoc")),
          date: query.Select(["data", "date"], query.Var("shipDoc")),
        }
      ))
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

export default { addScoreController, scoreListController, getContentController };