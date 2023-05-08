import { Application } from "../deps.ts";
import userRouter from "./user.routes.ts";
import authRouter from "./auth.routes.ts";
import rbytRouter from "./rbyt.routes.ts";

function init(app: Application) {
  app.use(authRouter.prefix("/api/auth/").routes());
  app.use(userRouter.prefix("/api/users/").routes());
  // 加分
  app.use(rbytRouter.prefix("/api/rbyt/").routes());

}

export default {
  init,
};