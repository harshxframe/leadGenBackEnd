import express from "express";
import {
  createAccount,
  loginAccount,
  sendVarificationCode,
  optVerification,
  getUser,
  updateUser,
  toggleBlockUser,
  getDashBoardUser,
  updateDevConfig,
} from "../controllers/auth.js";
import {
  checkEmailNotificationsEnabled,
  checkNewLogin,
  checkNewSignUp,
} from "../middlewares/accessValidator.js";

const authRouter = express.Router();

authRouter.post("/createAccount", checkNewSignUp, createAccount);
authRouter.post("/login", checkNewLogin, loginAccount);
authRouter.post("/getUser", getUser);
authRouter.post("/getDashboardUser", getDashBoardUser);
authRouter.post("/updateUser", updateUser);
authRouter.post("/devConfig", updateDevConfig);
authRouter.post("/blockUser", toggleBlockUser);
authRouter.post(
  "/sendVerificationCode",
  checkEmailNotificationsEnabled,
  sendVarificationCode,
);
authRouter.post("/varifyOtp", checkEmailNotificationsEnabled, optVerification);

export default authRouter;
