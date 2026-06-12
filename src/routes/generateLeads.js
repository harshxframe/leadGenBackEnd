import express from "express";
import { placeAPIRequest, placeJobRequest, getJobsStatus } from "../controllers/generateLeads.js";
import { checkApiRequest } from "../middlewares/accessValidator.js";
import { validateAPIRequest } from "../middlewares/apiAuthentification.js";

const generateLeadsRouter = express.Router();


generateLeadsRouter.post("/jobRequest", placeJobRequest); // Dashbord User
generateLeadsRouter.post("/api/jobRequest",checkApiRequest, validateAPIRequest, placeAPIRequest); // API User
generateLeadsRouter.post("/api/jobsStatus",checkApiRequest, validateAPIRequest, getJobsStatus); // API User



export default generateLeadsRouter;