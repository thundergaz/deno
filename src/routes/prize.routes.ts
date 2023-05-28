import { Router } from "../deps.ts";
import prizeController from "../controller/prize.controller.ts";

const router = new Router();

router.get<string>("/prizeList", prizeController.PrizeListController);
router.get<string>("/createPrize", prizeController.createPrizeController);

export default router;