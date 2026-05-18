import express from "express";
import { generateLeads } from "../controllers/generateLeads.js";

const generateLeadsRouter = express.Router();


generateLeadsRouter.post("/generateLeads", generateLeads);


export default generateLeadsRouter;