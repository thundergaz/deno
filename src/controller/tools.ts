import { Expr } from "https://esm.sh/faunadb@4.7.1";
import { query } from "../database/db.ts";

// 积分变动同时，更新经验
export const updateUserScore = (userName: string, score: number, needAddExp: boolean) =>
    // 先查出用户数据
    query.Map(
        query.Paginate(query.Match(query.Index("user_by_name"), userName)),
        query.Lambda(["userData"],
            query.Update(query.Var("userData"), {
                data: query.Merge(
                    {
                        score: query.Add(query.Select(["data", "score"], query.Get(query.Var("userData")), 0), score)
                    },
                    updateExp(query.Var("userData"), needAddExp, score)
                )
            })
        )
    );
// 获取用户的积分
export const getUserScore = (userName: string) =>
    query.Select(["data", "score"], query.Get(query.Select([0], query.Paginate(query.Match(query.Index("user_by_name"), userName)))));

// 经验满1000升级
export const updateExp = (userData: Expr, needAddExp: boolean, score: number) => 
    query.If(needAddExp,
        query.Let(
            {
                // 最终的exp是多少
                resExp: query.Add(query.Select(["data", "exp"], query.Get(userData), 0), score)
            },
            // 如果exp大于1000，
            query.If(query.GT(query.Var("resExp"), 1000),
                {
                    exp: query.Modulo(query.Var("resExp"), 1000),
                    level: query.Add(query.Select(["data", "level"], query.Get(userData), 0), query.Divide(query.Var("resExp"), 1000)),
                },
                {
                    exp: query.Var("resExp")
                })
        ),
        {})

// 添加积分记录
export const addScoreLog = (date: string, userName: string, score: number, description: string, type: string) => {
    const targetScore = ['minus', 'disable'].includes(type) ? -(score) : score;
    // 积分的增加 是否需要增加经验 
    const needAddExp = ['add', 'repair', 'task'].includes(type);
    const targetTime = new Date(date).toISOString();
    return [
        // 更新积分 有可能是加，有可能是减，再根据类型判断是否会增加经验
        updateUserScore(userName, targetScore, needAddExp),
        // 这里得记录一下，加分后积分是多少。
        query.Create(query.Collection("score"), {
            data: {
                date: query.ToTime(targetTime), score, description, userName, type,
                // 更新后是多少分
                afterScore: getUserScore(userName)
            }
        })
    ]
}