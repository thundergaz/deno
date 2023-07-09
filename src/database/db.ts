import query from "https://esm.sh/faunadb@4.7.1";
import Client from "https://esm.sh/faunadb@4.7.1";

// Grab the secret from the environment.
const token = Deno.env.get("FAUNA_SECRET");
if (!token) {
  throw new Error("environment variable FAUNA_SECRET not set");
}

const client = new Client.Client({
  secret: token,
  // Adjust the endpoint if you are using Region Groups
  endpoint: "https://db.fauna.com/",
});
// 查看初始化的配置是否完整，没有就需要重新创建
const initList = [
  // 孩子的日记
  {
    type: 'Collection',
    name: 'ChildrenDiary',
    action: () => query.CreateCollection({ name: "ChildrenDiary" })
  },
  {
    type: 'Index',
    name: 'children_diary_by_name',
    action: () => query.CreateIndex({
      name: "children_diary_by_name",
      source: query.Collection("ChildrenDiary"),
      terms: [
        { field: ["data", "userName"] }
      ],
      values: [
        { field: ["data", "date"], reverse: true },
        { field: ["ref"] }
      ]
    })
  },
  // 用户表
  {
    type: 'Collection',
    name: 'User',
    action: () => query.CreateCollection({ name: "User" })
  },
  {
    type: 'Index',
    name: 'user_by_name',
    action: () => query.CreateIndex({
      name: "user_by_name",
      source: query.Collection("User"),
      terms: [
        { field: ["data", "name"] }
      ],
      values: [
        { field: ["ref"] }
      ]
    })
  },
  // 积分表
  {
    type: 'Collection',
    name: 'score',
    action: () => query.CreateCollection({ name: "score" })
  },
  {
    type: 'Index',
    name: 'score_list',
    action: () => query.CreateIndex({
      name: "score_list",
      source: query.Collection("score"),
      terms: [
        { field: ["data", "userName"] }
      ],
      values: [
        { field: ["data", "date"], reverse: true },
        { field: ["ref"] }
      ]
    })
  },
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
        { field: ["data", "userName"] }
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
        { field: ["data", "date"], reverse: true },
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
        { field: ["data", "date"], reverse: true },
        { field: ["ref"] }
      ]
    })
  },
];
async function initDatabase() {
  console.log('检查数据库完整性。');
  initList.forEach(
    async item => {
      const res = await client.query(query.If(query.Exists(query[item.type](item.name)), `${item.type} ${item.name} is ready.`, query.Do(item.action(), `${item.type} ${item.name} create success.`)));
      console.log(res);
    }
  )
  console.log('检查完毕。');
  // 其它处理
  // const res: { data: any[] } = await client.query(
  //   query.Map(
  //     query.Paginate(query.Match(query.Index("rbyt_all_score"))),
  //     query.Lambda(
  //       ["ts","ref"],
  //       {
  //         id: query.Select(["ref", 'id'], query.Get(query.Var("ref"))),
  //         data: query.Select(["data"], query.Get(query.Var("ref")))
  //       }
  //       // query.Var("ref")
  //       // Update(Var("ref"), {
  //       //   data: {
  //       //     date: ToTime(Select(["data", "date"], Get(Var("ref"))))
  //       //   }
  //       // })
  //     )
  //   )
  // );

  // console.log(res.data.map( x => {
  //   x.data = {
  //     description: x.data.item.map( (y: any) => y.content).join(';'),
  //     title: x.data.item[0].content,
  //     date: x.data.date,
  //   };
  //   return x;
  // }));
  // res.data.forEach( async item => {
  //   const target = { ...item.data, userName: 'rbyt' };
  //   const re = await client.query(
  //     query.Create(query.Collection("ChildrenDiary"), {
  //         data: target
  //     })
  //   )
  //   console.log('..', re);
  // })
}
initDatabase();
const queryResult = async (...cb: (query.Expr|query.Expr[])[]) => {
  return await client
    .query(
      query.Do(
        ...cb
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