import type { RouterContext } from "../deps.ts";
import { client, query } from "../database/db.ts";

const addScoreController = async ({ request, response }: RouterContext<string>) => {
  const { item, date } = await request.body().value;
  const result = await client
  .query(
    query.Create(query.Collection("rbyt"), {
      data: {
        // 加分项
        item,
        // 加分的时间
        date
      }
    }
    )
  )
  .then((ret) => {
    return {
      ...ret,
      success: true
    }
  })
  .catch((err) => {
    return {
      ...err,
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
      ...ret,
      success: true
    }
  })
  .catch((err) => {
    return {
      ...err,
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