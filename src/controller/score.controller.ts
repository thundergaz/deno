import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";
import { updateUserScore, getUserScore } from "./tools.ts"
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
    const targetScore = ['minus','disable'].includes(type) ? -(score) : score;
    const needAddExp = ['add', 'repair', 'task'].includes(type);

    const result = await queryResult(
      // 更新积分 有可能是加，有可能是减
      updateUserScore(userName, targetScore, needAddExp),
      // 这里得记录一下，加分后积分是多少。
      query.Create(query.Collection("score"), {
        data: {
          date, score, description, userName, type,
          // 更新后是多少分
          afterScore: getUserScore(userName)
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
        query.Merge( 
          { id: query.Select(["ref", "id"], query.Var("shipDoc")) },
          query.Select(['data'], query.Var('shipDoc'))
        ),
      ))
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

export default { scoreListController, createScoreController };