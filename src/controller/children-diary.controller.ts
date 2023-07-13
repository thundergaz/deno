import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";
import { addScoreLog } from "./tools.ts"

const createController = async ({ request, response }: RouterContext<string>) => {
  const { date, title, description, weather, temperate, id, userName } = await request.body().value;
  const type = 'task';
  const scoreDescription = `完成了今日记录任务，增加5分。`;
  // 这里的时间必须是标准时间，以防万一，进行标准化。
  const nowTime = new Date(date).toISOString();
  // 查看增加内容如果有加分，就添加日志，更新的时候有一些为难。
  const result = !id ? await queryResult(
    query.Create(query.Collection("ChildrenDiary"), {
      data: {
        // 天气
        weather,
        // 温度
        temperate,
        // 标题
        title,
        // 描述
        description,
        // 加分的时间
        date: query.ToTime(nowTime),
        userName
      }
    }
    ),
    addScoreLog(date, userName, 5, scoreDescription, type)
  ) : await queryResult(
    query.Update(query.Ref(query.Collection("ChildrenDiary"), id), {
      data: {
        // 天气
        weather,
        // 温度
        temperate,
        // 描述
        description,
        // 标题
        title,
        // 加分的时间
        date: query.ToTime(nowTime)
      }
    })
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

const ListController = async ({ request, state, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request });
  const userName = queryData.userName;
  const result = await queryResult(
    query.Map(
      query.Paginate(query.Match(query.Index("children_diary_by_name"), userName)),
      query.Lambda(['time', 'scoreRef'],
        query.Let(
          {
            shipDoc: query.Get(query.Var("scoreRef"))
          },
          query.query.Merge(
            {
              id: query.Select(["ref", "id"], query.Var("shipDoc")),
              title: query.Select(["data", "title"], query.Var("shipDoc")),
              date: query.Format('%t',query.Select(["data", "date"], query.Var("shipDoc"))),
              weather: query.Select(["data", "weather"], query.Var("shipDoc"), ''),
              temperate: query.Select(["data", "temperate"], query.Var("shipDoc"), ''),
            },
            query.If(!!state.user_id, { description: query.Select(["data", "description"], query.Var("shipDoc"), '')}, {})
          )
        )
      )
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};
// 查找某天的内容，用于更新
const detailController = async ({ request, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request });
  const userName = queryData.userName;
  // 这里的时间必须是标准时间，以防万一，进行标准化。
  const searchDate = new Date(queryData.date).toISOString();
  const result = await queryResult(
    query.Map(
      query.Filter(
        query.Paginate(query.Match(query.Index("children_diary_by_name"), userName)),
        query.Lambda(
          ['time', 'planetRef'],
          query.Equals(query.TimeDiff(query.Select(["data", "date"], query.Get(query.Var("planetRef"))), query.ToTime(searchDate), 'days'),0)
        )
      ),
      query.Lambda(['time', 'scoreRef'], query.Let(
        {
          shipDoc: query.Get(query.Var("scoreRef"))
        },
        {
          id: query.Select(["ref", "id"], query.Var("shipDoc")),
          title: query.Select(["data", "title"], query.Var("shipDoc")),
          description: query.Select(["data", "description"], query.Var("shipDoc")),
          date: query.Format('%t',query.Select(["data", "date"], query.Var("shipDoc"))),
          weather: query.Select(["data", "weather"], query.Var("shipDoc"), ''),
          temperate: query.Select(["data", "temperate"], query.Var("shipDoc"), ''),
        }
      ))
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

export default { createController, detailController, ListController };