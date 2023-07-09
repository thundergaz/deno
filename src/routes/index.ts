import { Application } from "../deps.ts";
import userRouter from "./user.routes.ts";
import authRouter from "./auth.routes.ts";
import blogRouter from "./blog.routes.ts";
import prizeRouter from "./prize.routes.ts";
import scoreRouter from "./score.routes.ts";
import childrenDiaryRouter from "./children-diary.routes.ts";


function init(app: Application) {
  app.use(authRouter.prefix("/api/auth/").routes());
  app.use(userRouter.prefix("/api/users/").routes());
  // 加分
  app.use(blogRouter.prefix("/api/blog/").routes());
  app.use(prizeRouter.prefix("/api/prize/").routes());
  app.use(scoreRouter.prefix("/api/score/").routes());
  app.use(childrenDiaryRouter.prefix("/api/children/").routes());
}

export default {
  init,
};