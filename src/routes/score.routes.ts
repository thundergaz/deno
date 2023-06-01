import { Router } from "../deps.ts";
import scoreController from "../controller/score.controller.ts";

const router = new Router();

router.post<string>("/add", scoreController.createScoreController);
router.get<string>("/list", scoreController.scoreListController);

export default router;