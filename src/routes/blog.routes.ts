import { Router } from "../deps.ts";
import requireUser from "../middleware/requireUser.ts";
import blogController from "../controller/blog.controller.ts";

const router = new Router();

router.post<string>("/create", requireUser, blogController.createBlogController);
router.get<string>("/list", blogController.blogListController);
router.get<string>("/detial", blogController.detailContentController);

export default router;