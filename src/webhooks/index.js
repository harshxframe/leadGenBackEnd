import express from "express";
import { lemonSqueezyWebhook } from "./lemonSqueezyWebhook.js";
import { razorpayWebhook } from "./razorpayWebhook.js";
import { lemonSqueezyAuth } from "../middlewares/webhooksAuthentication.js";


const webhookRouter = express.Router();

webhookRouter.post("/lemonSqueezyWh",lemonSqueezyAuth, lemonSqueezyWebhook);
webhookRouter.post("/razorpayWh",razorpayWebhook);




export default webhookRouter;