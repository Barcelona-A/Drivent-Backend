import { conflictError, notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { customerNotTicket, customerNotPayment } from "@/errors/cannot-list-hotels-error";
import { ticketIsRemote } from "@/errors/ticket-is-remote-error";
import activitiesRepository from "@/repositories/activities-repository";
import { Activity, Local, ActivityBooking } from "@prisma/client";
import { invalidDataError } from "@/errors";
import { DateType, Hash } from "@/protocols";
import redis from "@/repositories/redis-repository";

async function getActivities(userId: number, activityDate: string | undefined): Promise<string[] | Activity[] | LocalsActivities[]> {
  await checkTicketIsRemote(userId);
  const datesKey = "activitiesDates";
  const activitiesKey = "activitiesLocals";

  if (activityDate) {    
    const timeStamp: number | string = Date.parse(activityDate);
    if (isNaN(timeStamp)) {
      throw invalidDataError(["Date cannot be read"]);
    }

    //const activitiesExistsOnRedis = await redis.exists(activitiesKey);
    //if(activitiesExistsOnRedis) return getOnRedis(activitiesKey);

    const date: Date = new Date(timeStamp);
    return activitiesRepository.findActivitiesWithLocals(date);
  }

  const datesExistsOnRedis = await redis.exists(datesKey);
  if (datesExistsOnRedis) return getOnRedis(datesKey);

  const listActivitiesDate = await activitiesRepository.findActivitiesDate();

  const allDates = listActivitiesDate.map(value => {
    return value.date.toUTCString();
  });
  
  const dates = await extractDates(allDates);
  await saveOnRedis(dates, datesKey);
  return getOnRedis(activitiesKey);
}

async function extractDates(allDates: DateType) {
  const hashDates: Hash = {};
  
  for (const i in allDates) {
    if (hashDates[allDates[i]]) continue;

    hashDates[allDates[i]] = true;
  }

  const differentDates = Object.keys(hashDates);
  return differentDates;
}

async function getOnRedis(key: string) {
  const datesFromRedis = JSON.parse(await redis.get(key));
  return datesFromRedis;
}

async function saveOnRedis(data: any, key: string) {
  const dataForRedis = JSON.stringify(data);
  return redis.set(key, dataForRedis);
}

async function checkTicketIsRemote(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  
  if(!ticket) {
    throw customerNotTicket();
  }

  if (ticket.TicketType.isRemote ) {
    throw ticketIsRemote();
  }

  if(ticket.status === "RESERVED") {
    throw customerNotPayment();
  }
}

async function checkActivityAvailability(activityId: number, userId: number) {
  const activitiy = await activitiesRepository.findActivitiesById(Number(activityId));

  if(!activitiy)  {
    throw notFoundError();
  }

  const quantityBookings = (await activitiesRepository.findActivitiesBookingByActivityId(Number(activityId))).length;
  const userActivities = await activitiesRepository.findActivitiesBookingByUserId(Number(userId));
  const filteredActivities = userActivities.filter((act) => act.Activity.date.getDate() === activitiy.date.getDate());
  const conflict = filteredActivities.filter((act) => (act.Activity.startsAt <= activitiy.startsAt && act.Activity.endsAt >= activitiy.startsAt));

  if(activitiy.capacity <= quantityBookings) {
    throw conflictError("Conflict");
  }

  if(conflict.length > 0) {
    throw conflictError("Conflict");
  }

  await activitiesRepository.createActivitiesBooking(activityId, userId);
}

const activitiesService = {
  getActivities,
  checkActivityAvailability,
};

export default activitiesService;

export type LocalsActivities = (Local & {
  Activity: {
      date: Date;
      id: number;
      name: string;
      startsAt: Date;
      endsAt: Date;
      capacity: number;
      _count: {
        ActivityBooking: number;
      }
  }[];
});
