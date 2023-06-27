import { users } from "../controller/auth.controller.ts";
import type { Context } from "../deps.ts";
import { verifyJwt } from "../utils/jwt.ts";
import { routerWhiteList } from "../routerWhiteList.ts"

const requireUser = async (ctx: Context, next: () => Promise<unknown>) => {
  try {
    const headers: Headers = ctx.request.headers;
    const authorization = headers.get("Authorization");
    const cookieToken = await ctx.cookies.get("access_token");
    let access_token;

    if (authorization) {
      access_token = authorization.split(" ")[1];
    } else if (cookieToken) {
      access_token = cookieToken;
    }
    // 如果在白名单中，并且未带token直接过
    const routerPath = ctx.request.url.pathname;
    if (routerWhiteList.includes(routerPath) && !access_token) {
      await next();
      return;
    }
    // 以下为必须要带token的连接 ======
    // 请求未带 access_token 返回 401
    if (!access_token) {
      ctx.response.status = 401;
      ctx.response.body = {
        status: "fail",
        message: "You are not logged in",
      };
      return;
    }
    // 验证token是否过期
    let decoded;
    try {
      decoded = await verifyJwt<{ sub: string }>({
        token: access_token,
        publicKeyPem: "ACCESS_TOKEN_PUBLIC_KEY",
      });
    } catch (error) {
      if (error.message === 'The jwt is expired.') {
        console.log('token 过期了');
        const message = 'The jwt is expired.';
        // 只是过期的话，需要准备续期 返回已经过期，前台拦截过期信息，拿到刷新token
        ctx.response.status = 401;
        ctx.response.body = {
          status: "expired",
          message,
        };
        return;
      } else {
        // 无效的token，就返过未授权的数据
        // 解析失败后 如果在白名单中，还是按正常通过。
        const message = "Token is invalid or session has expired";
        if (routerWhiteList.includes(routerPath)) {
          console.log('解析失败后 在白名单中，还是按正常通过。');
          await next();
          return;
        } else {
          console.log('解析失败后 没在白名单，返回失败。');
          ctx.response.status = 401;
          ctx.response.body = {
            status: "fail",
            message,
          };
          return;
        }
      }
    }

    // 找不到用户提示失败
    const user = users.find((user) => user.name === decoded.sub);
    if (!user) {
      const message = '用户错误。';
      ctx.response.status = 401;
      ctx.response.body = {
        status: "fail",
        message,
      };
      return;
    }
    // 增加用户信息
    ctx.state["user_type"] = user.type;
    ctx.state["user_id"] = user.name;
    await next();
    delete ctx.state.user_id;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      status: "fail",
      message: error.message,
    };
  }
};

export default requireUser;