import express from "express";
import { updateAdminSettings, getAdminSettingsController, getAllUsers, sendUserInquery } from "../controllers/admin.js";
const adminRouter = express.Router();



adminRouter.get("/platformSettings", updateAdminSettings);
adminRouter.get("/getPlatformSetting", getAdminSettingsController);
adminRouter.post("/getAllUser", getAllUsers);
adminRouter.post("/sendUserInquery", sendUserInquery);

export default adminRouter;