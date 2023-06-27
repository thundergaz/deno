import { Router } from "../deps.ts";
import userController from "../controller/user.controller.ts";
import requireUser from "../middleware/requireUser.ts";

const router = new Router();

router.get<string>("/me", requireUser, userController.getMeController);
router.get<string>("/user", requireUser, userController.getUserController);
router.get<string>("/userList", requireUser, userController.userListController);

export default router;