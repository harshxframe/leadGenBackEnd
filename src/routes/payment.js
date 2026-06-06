import express from "express";
import { createRazorpayCheckOut, createLemonSqeezeCheckOut } from "../controllers/paymentController.js";

const paymentRouter = express.Router();


paymentRouter.post("lemonSqeezyGlobal/createCheckOut", createLemonSqeezeCheckOut);
paymentRouter.post("razorpayIn/createCheckOut", createRazorpayCheckOut);




export default paymentRouter;