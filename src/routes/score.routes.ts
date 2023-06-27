import { Router } from "../deps.ts";
import scoreController from "../controller/score.controller.ts";
import requireUser from "../middleware/requireUser.ts";

const router = new Router();
router.use(requireUser);

router.post<string>("/add", scoreController.createScoreController);
router.get<string>("/list", scoreController.scoreListController);
router.post<string>("/deal", scoreController.scoreTransferController);

export default router;