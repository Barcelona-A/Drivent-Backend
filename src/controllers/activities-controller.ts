import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import activitiesService from "@/services/activities-service";

export async function listActivities(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { activityDate } = req.query as any;
  
  try {
    const activities = await activitiesService.getActivities(userId, activityDate);
    
    return res.status(httpStatus.OK).send(activities);
  } catch(error) {
    if (error.name === "ticketIsRemote") {
      return res.sendStatus(httpStatus.NOT_ACCEPTABLE);
    }
    if (error.name === "customerNotPayment") {
      return res.sendStatus(403);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
