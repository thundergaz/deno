import {
  json,
  validateRequest,
} from "https://deno.land/x/sift@0.6.0/mod.ts";
import { queryFauna } from "../query.ts";
import * as jwt from "npm:jsonwebtoken@^8.5.1";
import * as lodash from "npm:lodash@^4.17.21";

export const UserRoute = {
  '/user/find/:user': getCurrentUser,
  '/user/getAll': getAllUser,
  // '/user/:id': getUserById,
  // '/user/delete/:id': removeUserById,
  // '/user/report/:id': updateReport,
  // 'POST /user/save': saveUser,
  // 'POST /user/upload': uploadList,
  // 'POST /user/sync': syncData,
}
// token签名
const buildToken = (info, key, expiresIn) => {
  return new Promise((resolve, reject) => {
      jwt.sign(info, key, { expiresIn }, (err, token) => {
          if (err) {
              reject(err)
          } else {
              resolve("Bearer " + token);
          }
      })
  })
}
// 查看当前用户
async function getCurrentUser(request: Request) {

  const BOOK_ROUTE = new URLPattern({ pathname: "/user/find/:user" });
  const match = BOOK_ROUTE.exec(request.url);
  let user;

  if (match) {
    user = match.pathname.groups.user;
    if (!user) {
      return json({ error: "no user data" }, { status: 500 });
    }
  } else {
    return json({ error: "no requiey param" }, { status: 500 });
  }

  // 这里为api的请求规则，请求方式以及请求体，不符合规则会报错。
  const { error, body } = await validateRequest(request, {
    GET: {},
  });
  // 验证请求体是否符合 要求
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  const query = `
      query {
        allUsers {
          data {
            name
            code
            activeDevice
            code
            deviceList,
            work
          }
        }
      }
    `;
  const { data, errors } = await queryFauna(query, {});
  if (errors) {
    console.error(errors.map((error) => error.message).join("\n"));
    return json({ error: "couldn't fetch the quotes" }, { status: 500 });
  }
  // 这里是所有用户列表
  const {
    // 这里要对应 schema 的 query-key.
    allUsers: { data: users },
  } = data as { allUsers: { data: string[] } };
  // 过滤出需要的用户
  const res = users.find( item => item.activeDevice.some( element => element === user ));

  const tokenInfo = lodash.pick(res, ['id', 'name', 'work'])
  const resBody = {
      info: tokenInfo,
      token: await buildToken({ ...tokenInfo }, 'thundergaz', 3600 * 24 * 7),
  };
  return json({ resBody });
}
// 获取全部用户列表
async function getAllUser(request: Request) {

  // 这里为api的请求规则，请求方式以及请求体，不符合规则会报错。
  const { error, body } = await validateRequest(request, {
    GET: {},
  });
  // 验证请求体是否符合 要求
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  const query = `
      query {
        allUsers {
          data {
            name
            code
            activeDevice
            code
            deviceList
          }
        }
      }
    `;

  const { data, errors } = await queryFauna(query, {});
  if (errors) {
    console.error(errors.map((error) => error.message).join("\n"));
    return json({ error: "couldn't fetch the quotes" }, { status: 500 });
  }

  const {
    // 这里要对应 schema 的 query-key.
    allUsers: { data: users },
  } = data as { allUsers: { data: string[] } };

  return json({ users });
}