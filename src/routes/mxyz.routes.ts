import { Router } from "../deps.ts";
import mxyzController from "../controller/mxyz.controller.ts";

const router = new Router();

router.post<string>("/addScore", mxyzController.addScoreController);
router.get<string>("/scoreList", mxyzController.scoreListController);
router.get<string>("/content", mxyzController.getContentController);

export default router;