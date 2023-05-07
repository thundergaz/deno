# deno
## http route
```
    const BOOK_ROUTE = new URLPattern({ pathname: "/books/:id" });

    function handler(req: Request): Response {
    const match = BOOK_ROUTE.exec(req.url);
    if (match) {
        const id = match.pathname.groups.id;
        return new Response(`Book ${id}`);
    }
    return new Response("Not found (try /books/1)", {
        status: 404,
    });
    }

    serve(handler);
```
## make 学习心得 https://blog.51cto.com/u_11045899/5344496
make 可以得简化 go 的 输入方式， 像这里的启动就是 make serve ，是直接调用了 makefile 中的 serve 项 命令。
## fauna 学习 https://juejin.cn/post/7067729559529422878

### 1.在Fauna中创建数据
```ts
import { client, q } from "../config/db";
const createProject = (name) =>
  client
    .query(
      q.Create(q.Collection("Project"), {
        data: {
          name,
        },
      })
    )
    .then((ret) => ret)
    .catch((err) => console.error(err));
export default createProject;

q.Map(
   q.Paginate(q.Match(q.Index("all_Pilots"))),
   q.Lambda("pilotRef", q.Get(q.Var("pilotRef")))
)
```
Lambda 相当于 js 的箭头函数 第一个参数代表 上一步的结果 传递给下面的表达式。
Var用于提取变量。在这种情况下,它取的“pilotRef”并返回文档参考。
Get将接收引用并返回实际文档。