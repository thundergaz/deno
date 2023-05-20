import { Router } from "../deps.ts";
import blogController from "../controller/blog.controller.ts";

const router = new Router();

router.post<string>("/create", blogController.createBlogController);
router.get<string>("/list", blogController.blogListController);
router.get<string>("/detial", blogController.detailContentController);

export default router;