import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";

const createBlogController = async ({ request, response }: RouterContext<string>) => {
  // 文章内容 # 标题 title # 分类 category 标签 tags # 创建日期 createdAt # 更新日期 updatedAt # 内容 content # 阅读次数 viewTimes # 评论数 comment
  const { title, category, tags, content, createdAt, id, description, } = await request.body().value;
  if ((!id && title && category && tags && content && description) || (id && title && category && tags && content && description && createdAt)) {
    const nowTime = new Date().toISOString();
    const result = !id ? (
        await queryResult(query.Create(query.Collection("blog"), {
          data: {
            title, category, description ,content, tags,
            createdAt: query.ToTime(nowTime),
            updatedAt: query.ToTime(nowTime),
          }
        }
        ))
      ) : (
        await queryResult(query.Update(query.Ref(query.Collection("blog"), id), {
          data: {
            title, category, content, tags, description,
            updatedAt: query.ToTime(nowTime)
          }
        })
      )
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

const blogListController = async ({ response }: RouterContext<string>) => {
  const result = await queryResult(
    query.Map(
      query.Paginate(query.Match(query.Index("blog_list"))),
      query.Lambda(['time', 'blogRef'],
        query.Let(
          {
            shipDoc: query.Get(query.Var("blogRef"))
          },
          query.Merge( 
            { id: query.Select(["ref", "id"], query.Var("shipDoc")) },
            [
              query.Select(['data'], query.Var('shipDoc')),
              {
                // 需要对时间进行转换
                createdAt: query.Format('%t', query.Select(['data', 'createdAt'], query.Var('shipDoc'))),
                updatedAt: query.Format('%t', query.Select(['data', 'updatedAt'], query.Var('shipDoc'))),
              },
            ]
          )
        )
      )
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

const detailContentController = async ({ request, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request })
  const articleId = queryData.id;
  const result = await queryResult(
    query.Let(
      { doc: query.Get(query.Ref(query.Collection("blog"), articleId)) },
      query.Merge( 
        { id: query.Select(["ref", "id"], query.Var("doc")) },
        [
          query.Select(['data'], query.Var('doc')),
          {
            // 需要对时间进行转换
            createdAt: query.Format('%t', query.Select(['data', 'createdAt'], query.Var('doc'))),
            updatedAt: query.Format('%t', query.Select(['data', 'updatedAt'], query.Var('doc'))),
          },
        ]
      )
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

export default { createBlogController, blogListController, detailContentController };