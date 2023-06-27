import { Router } from "../deps.ts";
import requireUser from "../middleware/requireUser.ts";
import prizeController from "../controller/prize.controller.ts";

const router = new Router();
router.use(requireUser);

router.get<string>("/prizeList", prizeController.PrizeListController);
router.post<string>("/createPrize", prizeController.createPrizeController);

export default router;