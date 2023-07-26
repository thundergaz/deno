import { Router } from "../deps.ts";
import authController from "../controller/auth.controller.ts";
import requireUser from "../middleware/requireUser.ts";

const router = new Router();

router.post<string>("/register", authController.signUpUserController);
router.post<string>("/login", authController.loginUserController);

router.get<string>("/logout", requireUser, authController.logoutController);

router.get<string>("/refresh", authController.refreshAccessTokenController);
router.post<string>("/uploadKey", authController.getUploadToken);

export default router;