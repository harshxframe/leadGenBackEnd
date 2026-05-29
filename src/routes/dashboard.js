import express from "express";
const dashbaordRouter = express.Router();



dashbaordRouter.get("/dashboard/stats", getStatus);



export default dashbaordRouter;