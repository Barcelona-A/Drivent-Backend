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

export async function bookActivity(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { activityId } = req.body;

  if(isNaN(activityId)) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
  try {
    await activitiesService.checkActivityAvailability(Number(activityId), userId);
    return res.sendStatus(httpStatus.CREATED);
  } catch (error) {
    if(error.name === "ConflictError") {
      return res.sendStatus(httpStatus.CONFLICT);
    }
    if(error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}
