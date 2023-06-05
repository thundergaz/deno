import { query } from "../database/db.ts";

// 积分变动
export const updateUserScore = (userName, score) =>
    // 先查出用户数据
    query.Map(
        query.Paginate(query.Match(query.Index("user_by_name"), userName)),
        query.Lambda(["userData"],
            query.Update(query.Var("userData"), {
                data: {
                    score: query.Add(query.Select(["data", "score"], query.Get(query.Var("userData"))), score)
                }
            })
        )
    );