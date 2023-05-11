import { RouterContext, helpers } from "../deps.ts";
import { client, query } from "../database/db.ts";

const addScoreController = async ({ request, response }: RouterContext<string>) => {
  const { item, date, id } = await request.body().value;
  const result = await client
    .query(
      id ? (
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
              item: query.Select(["data", "item"], query.Var("shipDoc")),
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

const getContentController = async ({ state, request, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request })
  const searchDate = queryData.date;
  const result = await client
    .query(
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

export default { addScoreController, scoreListController, getContentController };