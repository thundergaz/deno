import type { RouterContext } from "../deps.ts";
import { client, query } from "../database/db.ts";

const addScoreController = async ({ request, response }: RouterContext<string>) => {
  const qBody = await request.body().value;
  console.log(qBody);
  const { reason, score, date } = qBody;
  const result = await client
  .query(
    query.Create(query.Collection("rbyt"), {
      data: {
        // 加分的原因：
        reason,
        // 增加的分值
        score,
        // 加分的时间
        date
      }
    }
    )
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
      success: false
    }
  });
  if (result.success) {
    response.status = 200;
  } else {
    response.status = 500;
  }
  response.body = result;
};

const scoreListController = async ({ state, response }: RouterContext<string>) => {
  const result = await client
  .query(
    query.Map(
      query.Paginate(query.Match(query.Index("rbyt_all_score"))),
      query.Lambda('scoreRef', 
        query.Let(
          {
            shipDoc: query.Get(query.Var("scoreRef"))
          },
          {
            id: query.Select(["ref", "id"], query.Var("shipDoc")),
            reason: query.Select(["data", "reason"], query.Var("shipDoc")),
            score: query.Select(["data", "score"], query.Var("shipDoc")),
            date: query.Select(["data", "date"], query.Var("shipDoc")),
          }
        )
      )
    )
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
      success: false
    }
  });
  if (result.success) {
    response.status = 200;
  } else {
    response.status = 500;
  }
  response.body = result;
};

export default { addScoreController, scoreListController };