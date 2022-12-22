import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { listActivities } from "@/controllers/activities-controller";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("", listActivities);

export { activitiesRouter };
