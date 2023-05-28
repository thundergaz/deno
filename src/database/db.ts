import query from "https://esm.sh/faunadb@4.7.1";
import Client from "https://esm.sh/faunadb@4.7.1";

// Grab the secret from the environment.
const token = Deno.env.get("FAUNA_SECRET");
if (!token) {
  throw new Error("environment variable FAUNA_SECRET not set");
}

var client = new Client.Client({
  secret: token,
  // Adjust the endpoint if you are using Region Groups
  endpoint: "https://db.fauna.com/",
});
// 查看初始化的配置是否完整，没有就需要重新创建
const initList = [
  // 奖品表检查
  {
    type: 'Collection',
    name: 'prize',
    action: () => query.CreateCollection({ name: "prize" })
  },
  // 奖品索引
  {
    type: 'Index',
    name: 'prize_list',
    action: () => query.CreateIndex({
      name: "prize_list",
      source: query.Collection("prize"),
      terms: [
        { field: ["data", "userName"]}
      ],
      values: [
        { field: ["data", "createAt"], reverse: true },
        { field: ["ref"] }
      ]
    })
  },
  // 博客表检查
  {
    type: 'Collection',
    name: 'blog',
    action: () => query.CreateCollection({ name: "blog" })
  },
  // blog的索引
  {
    type: 'Index',
    name: 'blog_list',
    action: () => query.CreateIndex({
      name: "blog_list",
      source: query.Collection("blog"),
      values: [
        { field: ["data", "createdAt"], reverse: true },
        { field: ["ref"] }
      ]
    })
  },
  {
    type: 'Collection',
    name: 'mxyz',
    action: () => query.CreateCollection({ name: "mxyz" })
  },
  // 创建rbyt的索引
  {
    type: 'Index',
    name: 'mxyz_all_score',
    action: () => query.CreateIndex({
      name: "mxyz_all_score",
      source: query.Collection("mxyz"),
      values: [
        { field: ["ref"] }
      ]
    })
  },
  {
    type: 'Collection',
    name: 'rbyt',
    action: () => query.CreateCollection({ name: "rbyt" })
  },
  // 创建rbyt的索引
  {
    type: 'Index',
    name: 'rbyt_all_score',
    action: () => query.CreateIndex({
      name: "rbyt_all_score",
      source: query.Collection("rbyt"),
      values: [
        { field: ["ref"] }
      ]
    })
  },
]

const queryResult = async (type, name, cb) => {
  const targetAction = initList.filter(item => item.name === name && item.type === type)[0];
  return await client
    // .query(query.If(query.Exists(query[targetAction.type](targetAction.name)), cb, targetAction.action()))
    .query(
      query.If(
        query.Exists(
          query[targetAction.type](targetAction.name)
        ),
        cb,
        targetAction.action()
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
    })
};
export { queryResult, client, query };