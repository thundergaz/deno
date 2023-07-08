import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";
import { updateUserScore, getUserScore, addScoreLog } from "./tools.ts";
// 增加积分
const createScoreController = async ({ request, response }: RouterContext<string>) => {
  // 日期 date 积分数 score 描述 description
  /**
   * 因为积分牵扯到统计，所以每一项新建以后都不能修复，需在添加新的项目来中合需要修复的部分，比如，补分，禁用等。并要描述原由，用以跟踪。
   * date: 什么时间加的或减的积分
   * score: 加或减了多少积分
   * description: 原因理由是什么
   * type：类型 是加分（add），还是扣分（minus），还是之前漏掉的补分（repair），或是原来记错的要修复删除（disable）。
   * userName: 这是谁的积分
   */
  const { date, score, description, userName, type } = await request.body().value;
  if (date && score && description && userName && type) {
    const result = await queryResult(
      addScoreLog(date, userName, score, description, type),
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
const scoreListController = async ({ request, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request });
  const { userName } = queryData;
  const result = await queryResult(
    query.Map(
      query.Paginate(query.Match(query.Index("score_list"), userName), { size: 10 }),
      query.Lambda(['time', 'prizeRef'], query.Let(
        {
          shipDoc: query.Get(query.Var("prizeRef"))
        },
        query.Merge(
          query.Select(['data'], query.Var('shipDoc')),
          {
            id: query.Select(["ref", "id"], query.Var("shipDoc")),
            // 需要对时间进行转换
            date: query.Format('%t', query.Select(['data', 'date'], query.Var('shipDoc')))
          },
        ),
      ))
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

// 积分转移 目前还没有使用
const scoreTransferController = async ({ request, response }: RouterContext<string>) => {
  const { score, userName, to } = await request.body().value;
  const date = new Date().toLocaleString('zh', { timeZone: 'Asia/Shanghai' });
  if (score && userName && to) {
    const result = await queryResult(
      // userName 减少 score的积分 无经验
      updateUserScore(userName, -score, false),
      // userName 增加日志 你转移给 to score 积分
      query.Create(query.Collection("score"), {
        data: {
          date, score, description: `你转移给${to} ${score} 积分`, userName, type: 'minus',
          // 更新后是多少分
          afterScore: getUserScore(userName)
        }
      }),
      // to 增加 score 积分 无经验
      updateUserScore(to, score, false),
      // to 增加日志 userName 转移给你 score 积分
      query.Create(query.Collection("score"), {
        data: {
          date, score, description: `${userName}转移给你 ${score} 积分`, to, type: 'add',
          // 更新后是多少分
          afterScore: getUserScore(to)
        }
      }),
    );
    response.status = result.success ? 200 : 500;
    response.body = result;
  } else {
    response.status = 500;
    response.body = {
      msg: '必要的数据未提交'
    };
  }
}

export default { scoreListController, createScoreController, scoreTransferController };