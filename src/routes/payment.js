import express from "express";
import {
  createRazorpayCheckOut,
  createLemonSqeezeCheckOut,
  paymentHistory,
  getCredits
} from "../controllers/paymentController.js";
import { userAuthentication } from "../middlewares/authentification.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/lemonSqeezyGlobal/createCheckOut",
  userAuthentication,
  createLemonSqeezeCheckOut,
);
paymentRouter.post(
  "/razorpayIn/createCheckOut",
  userAuthentication,
  createRazorpayCheckOut,
);
paymentRouter.post("/paymentHistory", userAuthentication, paymentHistory);
paymentRouter.post("/getCredits", userAuthentication, getCredits);


export default paymentRouter;
