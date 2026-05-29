import express from "express";
const jobRouter = express.Router();



jobRouter.get("getJobs");
jobRouter.get("getJobById");
jobRouter.get("getJobStatuses");