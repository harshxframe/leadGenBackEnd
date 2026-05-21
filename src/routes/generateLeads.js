import express from "express";
import { generateLeads, placeJobRequest } from "../controllers/generateLeads.js";

const generateLeadsRouter = express.Router();


generateLeadsRouter.post("/generateLeads", generateLeads);
generateLeadsRouter.post("/jobRequest", placeJobRequest); // Dashbord User
generateLeadsRouter.post("/api/jobRequest", placeJobRequest); // API User


export default generateLeadsRouter;