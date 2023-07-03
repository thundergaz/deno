import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";
import { addScoreLog } from "./tools.ts"

const addScoreController = async ({ request, response }: RouterContext<string>) => {
  const { date, title, description, id } = await request.body().value;
  const type = 'task';
  const scoreDescription = `完成了今日记录任务，增加5分。`;
  // 查看增加内容如果有加分，就添加日志，更新的时候有一些为难。
  const result = !id ? await queryResult(
    query.Create(query.Collection("mxyz"), {
      data: {
        // 标题
        title,
        // 描述
        description,
        // 加分的时间
        date
      }
    }
    ),
    addScoreLog(date, 'mxyz', 5, scoreDescription, type)
  ) : await queryResult(
    query.Update(query.Ref(query.Collection("mxyz"), id), {
      data: {
        // 描述
        description,
        // 标题
        title,
        // 加分的时间
        date
      }
    })
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

const scoreListController = async ({ state, response }: RouterContext<string>) => {
  const result = await queryResult(
    query.Map(
      query.Paginate(query.Match(query.Index("mxyz_all_score"))),
      query.Lambda(['time', 'scoreRef'],
        query.Let(
          {
            shipDoc: query.Get(query.Var("scoreRef"))
          },
          query.query.Merge(
            {
              id: query.Select(["ref", "id"], query.Var("shipDoc")),
              title: query.Select(["data", "title"], query.Var("shipDoc")),
              date: query.Select(["data", "date"], query.Var("shipDoc")),
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
const getContentController = async ({ state, request, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request });
  const searchDate = queryData.date;
  const result = await queryResult(
    query.Map(
      query.Filter(
        query.Paginate(query.Match(query.Index("mxyz_all_score"))),
        query.Lambda(
          ['time', 'planetRef'],
          query.ContainsStr(
            query.Select(["data", "date"], query.Get(query.Var("planetRef"))),
            searchDate
          )
        )
      ),
      query.Lambda(['time', 'scoreRef'], query.Let(
        {
          shipDoc: query.Get(query.Var("scoreRef"))
        },
        {
          id: query.Select(["ref", "id"], query.Var("shipDoc")),
          title: query.Select(["data", "title"], query.Var("shipDoc")),
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