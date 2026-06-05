import express from "express";
import { userAuthentication } from "../middlewares/authentification.js";
import { getLeadsByJob, getJobsStatus, getRunningJobs, getLeadsJobsPag } from "../controllers/dashboard.js";
const dashbaordRouter = express.Router();

dashbaordRouter.post(
  "/getLeadJobs",
  userAuthentication,
  getLeadsJobsPag,
);
dashbaordRouter.post(
  "/getRunningJobsStatus",
  userAuthentication,
  getRunningJobs,
);
dashbaordRouter.post(
  "/getStaOfLeadsById",
  userAuthentication,
  getJobsStatus,
);
dashbaordRouter.post(
  "/getLeadsByJob",
  userAuthentication,
  getLeadsByJob,
);

export default dashbaordRouter;
