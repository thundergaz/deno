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
### 1.在Fauna中的数据操作
```js
Create(
  Collection("Pilots"),
  {
    data: {
      name: "Flash Gordon"
    }
  }
)

Create(
  Collection("Spaceships"),
  {
    data: {
      name: "Millennium Hawk",
      pilot: Ref(Collection("Pilots"), "266350546751848978")
    }
  }
)

Get(
  Ref(Collection("Spaceships"), "266354515987399186")
)

Update(
  Ref(Collection("Spaceships"), "266354515987399186"),
  {
    data: {
      name: "Millennium Falcon"
    }
  }
)

Delete (
  Ref(Collection("Spaceships"), "266354515987399186")
)
```
### 1.在Fauna中的索引操作
```js
// 创建一个列取所有宇航员的索引
CreateIndex({
  name: "all_Pilots",
  source: Collection("Pilots")
})
// 利用索引查询所有宇航员
Paginate(
  Match(
    Index("all_Pilots")
  )
)
// 输出到文档中
Map(
  Paginate(Match(Index("all_Pilots"))),
  Lambda('pilotRef', Get(Var('pilotRef')))
)
```
到目前为止，我们已经看到索引允许检索集合中的所有文档，但是索引的功能要强大得多。 
有了索引，你可以: 
实施唯一约束 
对结果进行排序和筛选 
从文档数据创建计算值

### 索引与SQL视图 
如果您来自关系领域，那么将索引视为关系数据库中的视图是有意义的。视图是存储查询，可以从多个表中检索数据，计算计算数据，连接表以创建虚拟实体，过滤等。在某种程度上，Fauna的索引执行类似的功能，我们将在本文中对此进行探讨。

## 跨多个集合建立索引 
到目前为止，我们的索引都是在来自单个集合的文档上创建的，但是您可以配置索引来包含来自多个集合的文档。 
你可能有很多原因想要这样做。也许，在设计数据库时，您希望将一些集合分组到单个虚拟集合下。在关系世界中，在单个实体下组合数据库实体称为多态性。 
为了测试这一点，让我们创建一个新的集合来存储我们的陆地车辆:
```JS
CreateCollection({name: "Speeders"})
```
现在，有了这个索引，你就可以检索数据库中所有的车辆:
```JS
CreateIndex({
  name: "all_Vehicles",
  source: [
    Collection("Spaceships"),
    Collection("Speeders")
  ]
})

```
当索引多个集合时，请记住，跨集合的索引字段需要具有相同的类型(字符串、数字等)。在接下来的示例中，为了简单起见，我们将对单个集合使用索引。

## 排序结果 
索引还允许我们对结果进行排序。让我们创建一个新的索引，按照飞行员的名字对他们进行排序:
```js
CreateIndex({
  name: "all_Pilots_sorted_by_name",
  source: Collection("Pilots"),
  values: [
    { field: ["data", "name"] },
    { field: ["ref"] }
  ]
})
```
这里，我们使用一个values对象来定义索引的输出值。 
在本例中，我们定义了两个输出值: 
"data"， "name"是指文档的name属性的路径。 
"ref"另一个路径，它将输出对匹配文档的引用。稍后，我们会看到为什么需要这个。 
当使用values对象时，默认情况下Fauna将始终按升序对结果进行排序:
```js
Paginate(Match(Index("all_Pilots_sorted_by_name")))

// Results:

{
  "data": [
    [
      "Buck Rogers",
      Ref(Collection("Pilots"), "266359371696439826")
    ],
    [
      "Flash Gordon",
      Ref(Collection("Pilots"), "266350546751848978")
    ],
    [
      "Jean-Luc Picard",
      Ref(Collection("Pilots"), "266359447111074322")
    ],
    // etc...
  ]
}
```
正如您所看到的，在索引的values对象中定义的每个结果中，Fauna将输出两个值，这些结果现在按这些值排序。 
### 相反的顺序 
如果我们想让飞行员按名字降序排序，我们需要一个反向设置的新索引:
```js
CreateIndex({
  name: "all_Pilots_sorted_by_name_desc",
  source: Collection("Pilots"),
  values: [
    { field: ["data", "name"], reverse: true},
    { field: ["ref"] }
  ]
})
```
### 从排序结果中获取文档 
你可以根据需要添加任意多的输出值，而不会造成任何性能损失，但我们可能需要从这些类型的结果中获取一个文档:
```js
["Buck Rogers", Ref(Collection("Pilots"), "266359371696439826")]
```
那么我们如何获取文档呢? 
一种选择是使用我们在前一篇文章中学到的Select函数:
```js
Map(
  Paginate(Match(Index("all_Pilots_sorted_by_name"))),
  Lambda("pilotResult", Get(Select([1], Var("pilotResult"))))
)
```
由于Fauna使用从零开始的数组，这里的技巧是选择第二个项中带有1的引用，然后使用Get返回一个文档。 
另一种选择是简单地配置我们的Lambda以期望一个包含两个值的数组:
```js
Map(
  Paginate(Match(Index("all_Pilots_sorted_by_name"))),
  Lambda(["name", "pilotRef"], Get(Var("pilotRef")))
)
```
最终我们最得到一样的结果
```js
{
  "data": [
    {
      "ref": Ref(Collection("Pilots"), "266359371696439826"),
      "ts": 1590278941740000,
      "data": {
        "name": "Buck Rogers"
      }
    },
    {
      "ref": Ref(Collection("Pilots"), "266350546751848978"),
      "ts": 1590270525630000,
      "data": {
        "name": "Flash Gordon"
      }
    },
    {
      "ref": Ref(Collection("Pilots"), "266359447111074322"),
      "ts": 1590279013675000,
      "data": {
        "name": "Jean-Luc Picard"
      }
    }
    // etc...
  ]
}
```
## 筛选结果 
索引的另一个有用特性是能够搜索和过滤结果。 
为了测试这一点，让我们创建一个行星集合:
```js
CreateCollection({name: "Planets"})
```
然后，创造三种不同类型的行星:类地行星、气态行星和冰态行星。
```js
Create(Collection("Planets"),
  {
    data: {
      name: "Mercury",
      type: "TERRESTRIAL"
    }
  }
)

Create(Collection("Planets"),
  {
    data: {
      name: "Saturn",
      type: "GAS"
    }
  }
)

// etc..
```
最后，让我们创建一个索引，按类型过滤我们的行星:
```js
CreateIndex({
  name: "all_Planets_by_type",
  source: Collection("Planets"),
  terms: [
    { field: ["data", "type"]}
  ]
})
```
如前所述，terms对象用作索引的搜索输入，而values对象定义索引将返回哪些数据。对于这个索引，没有定义values对象，因此默认情况下索引将返回ref。 
在本例中，我们告诉Fauna搜索词将使用在路径“data”、“type”处找到的文档字段。 
现在可以通过向Match传递一个参数来查询索引:
```js
Map(
  Paginate(Match(Index("all_Planets_by_type"), "GAS")),
  Lambda("planetRef", Get(Var("planetRef")))
)

// Result:

{
  "data": [
    {
      "ref": Ref(Collection("Planets"), "267081152090604051"),
      "ts": 1590967285200000,
      "data": {
        "name": "Jupiter",
        "type": "GAS"
      }
    },
    {
      "ref": Ref(Collection("Planets"), "267081181884842515"),
      "ts": 1590967313610000,
      "data": {
        "name": "Saturn",
        "type": "GAS"
      }
    }
  ]
}
```
### 对数组值进行过滤 
如果我们想要匹配数组内的项，而不是对单个字符串进行过滤，我们只需要传递 term 需要在数组内搜索的术语。 
为了测试这一点，让我们给船只添加一些颜色:
```js
Update(
  Ref(Collection("Spaceships"), "266356873589948946"),
  {
    data: {
      colors: ["RED","YELLOW"]
    }
  }
)

// etc...
```
如果我们现在想要基于单一颜色过滤船只，我们可以创建这个索引，它使用colors数组作为过滤项:
```js
CreateIndex({
  name: "all_Spaceships_by_color",
  source: Collection("Spaceships"),
  terms: [
    { field: ["data","colors"]}
  ]
})
```
这样搜索:
```js
Map(
  Paginate(Match(Index("all_Spaceships_by_color"), "WHITE")),
  Lambda("shipRef", Let({
    shipDoc: Get(Var("shipRef"))
  },{
    name: Select(["data","name"], Var("shipDoc")),
    colors: Select(["data","colors"], Var("shipDoc"))
  }))
)

// Result:

{
  data: [
    {
      name: "Explorer IV",
      colors: ["BLUE", "WHITE", "RED"]
    },
    {
      name: "Navigator",
      colors: ["WHITE", "GREY"]
    },
    {
      name: "Le Super Spaceship",
      colors: ["PINK", "MAGENTA", "WHITE"]
    }
  ]
}
```

如果我们现在想要基于单一颜色过滤船只，我们可以创建这个索引，它使用colors数组作为过滤项:Fauna足够聪明，能够理解如果terms对象中使用的字段是一个数组，那么它应该在该数组中搜索一个项目，而不是在整个数组中搜索完全匹配的项目。 
### 关于全文检索 
此时，只能使用精确匹配的索引来过滤文档。这个功能已经在Fauna的路线图上了，但是还没有提供官方的时间表。 
当然可以用其他方法解决这个问题。FQL有许多功能，可以让您实现全文搜索。 
让我们先创建一个索引来获取所有行星:
```js
CreateIndex({
  name: "all_Planets",
  source: Collection("Planets")
})
```
现在，我们可以将Filter, ContainsStr和LowerCase组合起来，对行星名称上的字符串“ur”进行不区分大小写的搜索:
```js
Map(
  Filter(
    Paginate(Match(Index("all_Planets"))),
    Lambda("planetRef",
      ContainsStr(
        LowerCase(Select(["data","name"],Get(Var("planetRef")))),
        "ur"
      )
    )
  ),
  Lambda("planetRef", Get(Var("planetRef")))
)

// Result:

{
  data: [
    {
      ref: Ref(Collection("Planets"), "267081079730471443"),
      ts: 1590977548370000,
      data: {
        name: "Mercury",
        type: "TERRESTRIAL",
        color: "GREY"
      }
    },
    {
      ref: Ref(Collection("Planets"), "267081181884842515"),
      ts: 1590977684790000,
      data: {
        name: "Saturn",
        type: "GAS",
        color: "YELLOW"
      }
    },
    {
      ref: Ref(Collection("Planets"), "267081222719537683"),
      ts: 1590977359690000,
      data: {
        name: "Uranus",
        type: "ICE",
        color: "BLUE"
      }
    }
  ]
}
```

### 排序和过滤同时进行 
你当然可以同时做这两件事，在同一个索引中组合项和值:

```js
CreateIndex({
  name: "all_Planets_by_type_sorted_by_name",
  source: Collection("Planets"),
  terms: [
    { field: ["data", "type"]}
  ],
  values: [
    { field: ["data", "name"]},
    { field: ["ref"] }
  ]
})
```
And then
```js
Map(
  Paginate(Match(Index("all_Planets_by_type_sorted_by_name"), "TERRESTRIAL")),
  Lambda("planetResult", Get(Select([1], Var("planetResult"))))
)

// Result:

{
  "data": [
    {
      "ref": Ref(Collection("Planets"), "267081091831038483"),
      "ts": 1590967227710000,
      "data": {
        "name": "Earth",
        "type": "TERRESTRIAL"
      }
    },
    {
      "ref": Ref(Collection("Planets"), "267081096484618771"),
      "ts": 1590967232165000,
      "data": {
        "name": "Mars",
        "type": "TERRESTRIAL"
      }
    },
    // etc ...
  ]
}
```
https://fauna.com/blog/getting-started-with-fql-faunadbs-native-query-language-part-2#filtering-results

Paginate(Collections()) 获取所有表
Paginate(Indexes()) 所有索引
Paginate(Databases()) 所有库
## 时间范围过滤
````
> CreateIndex({
  name: "all_Teleporations_by_ts_range",
  source: Collection("Teleportations"),
  values: [
    { field: ["data", "ts"]},
    { field: "ref"}
  ]
})

> Paginate(
  Range(
    Match(Index("all_Teleporations_by_ts_range")),
    Now(),
    TimeAdd(Now(), 100, "days")
  )
)
{
  data: [
    [
      Time("2020-08-19T12:56:31.102631Z"),
      Ref(Collection("Teleportations"), "274138599280083456")
    ],
    [
      Time("2020-08-28T09:56:34.304009Z"),
      Ref(Collection("Teleportations"), "274157476972069395")
    ]
  ]
}

> Paginate(
  Range(
    Match(Index("all_Teleporations_by_ts_range")),
    ToTime(Date("2020-01-01")),
    ToTime(Date("2021-01-01"))
  )
)
{
  data: [
    [
      Time("2020-08-19T12:56:31.102631Z"),
      Ref(Collection("Teleportations"), "274138599280083456")
    ],
    [
      Time("2020-08-28T09:56:34.304009Z"),
      Ref(Collection("Teleportations"), "274157476972069395")
    ]
  ]
}
````