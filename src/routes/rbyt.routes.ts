import { Router } from "../deps.ts";
import requireUser from "../middleware/requireUser.ts";
import rbytController from "../controller/rbyt.controller.ts";

const router = new Router();
router.use(requireUser);

router.post<string>("/addScore", rbytController.addScoreController);
router.get<string>("/scoreList", rbytController.scoreListController);
router.get<string>("/content", rbytController.getContentController);

export default router;