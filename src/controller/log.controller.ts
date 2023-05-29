import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";

const LogListController = async ({ state, request ,response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request });
  const { userName, type } = queryData;
  const result = await queryResult(
    query.Map(
      query.Paginate(query.Match(query.Index("prize_list"), userName, type)),
      query.Lambda(['time', 'prizeRef'],query.Get(query.Var("prizeRef")))
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

export default { LogListController };