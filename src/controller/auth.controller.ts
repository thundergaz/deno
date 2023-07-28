import { RouterContext } from "../deps.ts";
import { signJwt, verifyJwt } from "../utils/jwt.ts";

export type IUser = {
  id?: string;
  name: string;
  type?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const users: IUser[] = [
  {
    email: '',
    name: 'rbyt',
    type: 'use'
  },
  {
    email: '',
    name: 'mxyz',
    type: 'use'
  },
  {
    email: '',
    name: 'sturat',
    type: 'manage'
  },
  {
    email: '',
    name: 'abby',
    type: 'manage'
  },
];
const ACCESS_TOKEN_EXPIRES_IN = 60 * 24;
const REFRESH_TOKEN_EXPIRES_IN = 60 * 24 * 30;

const signUpUserController = async ({
  request,
  response,
}: RouterContext<string>) => {
  try {
    const {
      name,
      email
    }: { name: string; email: string; password: string } = await request.body()
      .value;

    const userExists = users.find((user) => user.name === name);
    if (userExists) {
      response.status = 409;
      response.body = {
        status: "fail",
        message: "User with that email already exists",
      };
      return;
    }

    const createdAt = new Date();
    const updatedAt = createdAt;
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      createdAt,
      updatedAt,
    };

    users.push(user);

    response.status = 201;
    response.body = {
      status: "success",
      user,
    };
  } catch (error) {
    response.status = 500;
    response.body = { status: "error", message: error.message };
    return;
  }
};

const loginUserController = async ({
  request,
  response,
}: RouterContext<string>) => {
  try {
    const { name }: { name: string; password: string } =
      await request.body().value;

    const user = users.find((user) => user.name === name);

    if (!user) {
      response.status = 401;
      response.body = {
        status: "fail",
        message: "Invalid email or password",
      };
      return;
    }

    const accessTokenExpiresIn = new Date(
      Date.now() + ACCESS_TOKEN_EXPIRES_IN * 60 * 1000
    );
    const refreshTokenExpiresIn = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRES_IN * 60 * 1000
    );
    const { token: access_token } = await signJwt({
      user_id: user.name,
      privateKeyPem: "ACCESS_TOKEN_PRIVATE_KEY",
      expiresIn: accessTokenExpiresIn,
      issuer: "website.com",
    });
    const { token: refresh_token } = await signJwt({
      user_id: user.name,
      privateKeyPem: "REFRESH_TOKEN_PRIVATE_KEY",
      expiresIn: refreshTokenExpiresIn,
      issuer: "website.com",
    });

    response.status = 200;
    response.body = { status: "success", access_token, refresh_token };
  } catch (error) {
    response.status = 500;
    response.body = { status: "error", message: error.message };
    return;
  }
};
// 刷新 token
const refreshAccessTokenController = async ({
  request,
  response,
}: RouterContext<string>) => {
  try {
    const authorization = await request.headers.get("Authorization")!;

    const message = "Could not refresh access token";
    const refresh_token = authorization.split(" ")[1];

    if (!refresh_token) {
      response.status = 403;
      response.body = {
        status: "fail",
        message,
      };
      return;
    }
    // 验证刷新token
    const decoded = await verifyJwt<{ sub: string }>({
      token: refresh_token,
      publicKeyPem: "REFRESH_TOKEN_PUBLIC_KEY",
    });

    if (!decoded) {
      response.status = 403;
      response.body = {
        status: "fail",
        message,
      };
      return;
    }

    // 生成新的访问令牌
    const accessTokenExpiresIn = new Date(
      Date.now() + ACCESS_TOKEN_EXPIRES_IN * 60 * 1000
    );

    const { token: access_token } = await signJwt({
      user_id: decoded.sub,
      issuer: "website.com",
      privateKeyPem: "ACCESS_TOKEN_PRIVATE_KEY",
      expiresIn: accessTokenExpiresIn,
    });

    response.status = 200;
    response.body = { status: "success", access_token };
  } catch (error) {
    response.status = 500;
    response.body = { status: "error", message: error.message };
    return;
  }
};

const logoutController = ({ response, cookies }: RouterContext<string>) => {
  cookies.set("access_token", "", {
    httpOnly: true,
    secure: false,
    maxAge: -1,
  });
  cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: false,
    maxAge: -1,
  });

  response.status = 200;
  response.body = { status: "success" };
};
export default {
  signUpUserController,
  loginUserController,
  logoutController,
  refreshAccessTokenController
};