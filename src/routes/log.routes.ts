import { Router } from "../deps.ts";
import logController from "../controller/log.controller.ts";

const router = new Router();

router.get<string>("/list", logController.LogListController);

export default router;