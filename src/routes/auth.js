import express from "express";
import { createAccount, loginAccount, sendVarificationCode, optVerification } from "../controllers/auth.js";

const authRouter = express.Router();



authRouter.post("/createAccount", createAccount);
authRouter.post("/login", loginAccount);
authRouter.post("/sendVerificationCode", sendVarificationCode);
authRouter.post("/varifyOtp", optVerification);


export default authRouter;
