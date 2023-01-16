import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { bookActivity, listActivities } from "@/controllers/activities-controller";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("/", listActivities)
  .post("/", bookActivity);

export { activitiesRouter };
