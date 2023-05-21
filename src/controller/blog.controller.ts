import { RouterContext, helpers } from "../deps.ts";
import { queryResult, query } from "../database/db.ts";

const createBlogController = async ({ request, response }: RouterContext<string>) => {
  // 文章内容 # 标题 title # 分类 category 标签 tags # 创建日期 createdAt # 更新日期 updatedAt # 内容 content # 阅读次数 viewTimes # 评论数 comment
  const { title, category, tags, content, createdAt, id, description, } = await request.body().value;
  if ( title && category && tags && content && createdAt && description) {
    const result = await queryResult( 'Collection', 'blog',
      !id ? (
        query.Create(query.Collection("blog"), {
          data: {
            title, category, description ,content, tags,
            createdAt: new Date().toLocaleString(),
            updatedAt: new Date().toLocaleString(),
          }
        }
        )
      ) : (
        query.Update(query.Ref(query.Collection("blog"), id), {
          data: {
            title, category, content, tags,
            createdAt,
            updatedAt: new Date().toLocaleString()
          }
        })
      )
    );
    response.status = result.success ? 200 : 500;
    response.body = result;
  } else {
    response.status = 500;
    response.body = '必要的数据未填';
  }

};

const blogListController = async ({ state, response }: RouterContext<string>) => {
  const result = await queryResult( 'Index', 'blog_list',
    query.Map(
      query.Paginate(query.Match(query.Index("blog_list"))),
      query.Lambda('blogRef',
        query.Let(
          {
            shipDoc: query.Get(query.Var("blogRef"))
          },
          {
            id: query.Select(["ref", "id"], query.Var("shipDoc")),
            title: query.Select(["data", "title"], query.Var("shipDoc")),
            category: query.Select(["data", "category"], query.Var("shipDoc")),
            tags: query.Select(["data", "tags"], query.Var("shipDoc")),
            content: query.Select(["data", "content"], query.Var("shipDoc")),
            createdAt: query.Select(["data", "createdAt"], query.Var("shipDoc")),
            updatedAt: query.Select(["data", "updatedAt"], query.Var("shipDoc")),
            // 评论
            // comment: 
          }
        )
      )
    )
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

const detailContentController = async ({ state, request, response }: RouterContext<string>) => {
  const queryData = helpers.getQuery({ request })
  const articleId = queryData.id;
  const result = await queryResult('Collection','blog',
    query.Let({ doc: query.Get(query.Ref(query.Collection("blog"), articleId)) }, query.Select(['data'], query.Var('doc')))
  );
  response.status = result.success ? 200 : 500;
  response.body = result;
};

export default { createBlogController, blogListController, detailContentController };