import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";

const addScoreController = async ({ request, response }: RouterContext<string>) => {
  const { item, date, id } = await request.body().value;
  const result = await queryResult(
    !id ? (
      query.Create(query.Collection("rbyt"), {
        data: {
          // 加分项
          item,
          // 加分的时间
          date
        }
      }
      )
    ) : (
      query.Update(query.Ref(query.Collection("rbyt"), id), {
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
  const result = await queryResult(
    query.Map(
      query.Paginate(query.Match(query.Index("rbyt_all_score"))),
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

const getContentController = async ({ state, request, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request });
  const searchDate = queryData.date;
  const result = await queryResult(
    query.Map(
      query.Filter(
        query.Paginate(query.Match(query.Index("rbyt_all_score"))),
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