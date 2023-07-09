import { Router } from "../deps.ts";
import requireUser from "../middleware/requireUser.ts";
import childrenDiaryController from "../controller/children-diary.controller.ts";

const router = new Router();
router.use(requireUser);

router.post<string>("/new", childrenDiaryController.createController);
router.get<string>("/list", childrenDiaryController.ListController);
router.get<string>("/detail", childrenDiaryController.detailController);

export default router;