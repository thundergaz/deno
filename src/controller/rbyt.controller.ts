import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";

const addScoreController = async ({ request, response }: RouterContext<string>) => {
  const { item, date, id } = await request.body().value;
  // 这里的时间必须是标准时间，以防万一，进行标准化。
  const nowTime = new Date(date).toISOString();
  const result = 
    !id ? (
      await queryResult(query.Create(query.Collection("rbyt"), {
        data: {
          // 加分项
          item,
          // 加分的时间
          date: query.ToTime(nowTime)
        }
      }
      ))
    ) : (
      await queryResult(query.Update(query.Ref(query.Collection("rbyt"), id), {
        data: {
          // 加分项
          item,
          // 加分的时间
          date: query.ToTime(nowTime)
        }
      })
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

const scoreListController = async ({ response }: RouterContext<string>) => {
  const result = await queryResult(
    query.Map(
      query.Paginate(query.Match(query.Index("rbyt_all_score"))),
      query.Lambda(['time', 'scoreRef'],
        query.Let(
          {
            shipDoc: query.Get(query.Var("scoreRef"))
          },
          {
            id: query.Select(["ref", "id"], query.Var("shipDoc")),
            item: query.Select(["data", "item"], query.Var("shipDoc")),
            date: query.Format('%t', query.Select(['data', 'date'], query.Var('shipDoc'))),
          }
        )
      )
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

// 按日期查找某一天的内容
/**
 * 当结果大于0是，不在同一天
 * TimeDiff(Time('1970-01-01T00:00:00+00:00'), Time('1970-01-01T00:00:00+00:00'), 'days'),
 * 
 */
const getContentController = async ({ request, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request });
  // 这里的时间必须是标准时间，以防万一，进行标准化。
  const searchDate = new Date(queryData.date).toISOString();
  const result = await queryResult(
    query.Map(
      query.Filter(
        query.Paginate(query.Match(query.Index("rbyt_all_score"))),
        query.Lambda(
          ['time', 'planetRef'],
          // true 时间相差为0天时
          query.Equals(query.TimeDiff(query.Select(["data", "date"], query.Get(query.Var("planetRef"))), query.ToTime(searchDate), 'days'),0)
        )
      ),
      query.Lambda(['time', 'scoreRef'], query.Let(
        {
          shipDoc: query.Get(query.Var("scoreRef"))
        },
        {
          id: query.Select(["ref", "id"], query.Var("shipDoc")),
          item: query.Select(["data", "item"], query.Var("shipDoc")),
          date: query.Format('%t', query.Select(['data', 'date'], query.Var('shipDoc'))),
        }
      ))
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

export default { addScoreController, scoreListController, getContentController };