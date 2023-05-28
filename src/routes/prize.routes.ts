import { Router } from "../deps.js";
import prizeController from "../controller/prize.controller.js";

const router = new Router();

router.get<string>("/prizeList", prizeController.PrizeListController);
router.get<string>("/createPrize", prizeController.createPrizeController);

export default router;