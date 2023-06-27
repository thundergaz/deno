import { Router } from "../deps.ts";
import requireUser from "../middleware/requireUser.ts";
import mxyzController from "../controller/mxyz.controller.ts";

const router = new Router();
router.use(requireUser);

router.post<string>("/addScore", mxyzController.addScoreController);
router.get<string>("/scoreList", mxyzController.scoreListController);
router.get<string>("/content", mxyzController.getContentController);

export default router;