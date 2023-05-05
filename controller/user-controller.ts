import {
  json,
  validateRequest,
} from "https://deno.land/x/sift@0.6.0/mod.ts";
import { queryFauna } from "../query.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@$VERSION/mod.ts";
import lodash from "https://deno.land/x/lodash@4.17.19/lodash.js";

export const UserRoute = {
  '/user/find/:user': getCurrentUser,
  // '/user/getAll': getAllUser,
  // '/user/:id': getUserById,
  // '/user/delete/:id': removeUserById,
  // '/user/report/:id': updateReport,
  // 'POST /user/save': saveUser,
  // 'POST /user/upload': uploadList,
  // 'POST /user/sync': syncData,
}
const signKey = await crypto.subtle.generateKey(
  { name: "THUNDERGAZ", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);
// 过期时间
const nbf = getNumericDate(60 * 60 * 7);
// token签名
const buildToken = (info) => {
  return new Promise((resolve, reject) => {
    // token中加密的数据
    const signInData = { ...info, exp: nbf };
    create({ alg: "HS512", typ: "JWT" }, signInData, signKey).then( token => {
      resolve(token);
    });
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
      token: await buildToken({ ...tokenInfo }),
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