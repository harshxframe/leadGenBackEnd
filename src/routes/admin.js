import express from "express";
import { updateAdminSettings, getAdminSettingsController } from "../controllers/admin.js";
const adminRouter = express.Router();



adminRouter.get("/platformSettings", updateAdminSettings);
adminRouter.get("/getPlatformSetting", getAdminSettingsController);


export default adminRouter;