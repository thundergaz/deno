import { Router } from "../deps.ts";
import rbytController from "../controller/rbyt.controller.ts";

const router = new Router();

router.post<string>("/addScore", rbytController.addScoreController);
router.get<string>("/scoreList", rbytController.scoreListController);

export default router;