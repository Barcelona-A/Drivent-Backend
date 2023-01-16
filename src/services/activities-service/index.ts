import { conflictError, notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { customerNotTicket, customerNotPayment } from "@/errors/cannot-list-hotels-error";
import { ticketIsRemote } from "@/errors/ticket-is-remote-error";
import activitiesRepository from "@/repositories/activities-repository";
import { Activity, Local, ActivityBooking } from "@prisma/client";
import { invalidDataError } from "@/errors";

async function getActivities(userId: number, activityDate: string | undefined): Promise<string[] | Activity[] | LocalsActivities[]> {
  await checkTicketIsRemote(userId);

  if (activityDate) {    
    const timeStamp = Date.parse(activityDate);
    if (isNaN(timeStamp)) {
      throw invalidDataError(["Date cannot be read"]);
    }

    const date = new Date(timeStamp);
    return activitiesRepository.findActivitiesWithLocals(date);
  }

  const listActivitiesDate = await activitiesRepository.findActivitiesDate();

  const arrDates = listActivitiesDate.map(value => {
    return value.date.toUTCString();
  });

  const dates: string[] = []; //implementar hashtable
  for (const i in arrDates) {
    const dateAlreadyExists = dates.find(element => element === arrDates[i]);
    if (dateAlreadyExists) {
      continue;
    }
    dates.push(arrDates[i]);
  }

  return dates;
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
  const activitiy = await activitiesRepository.findActivitiesById(activityId);
  const quantityBookings = (await activitiesRepository.findActivitiesBookingByActivityId(activityId)).length;
  const userActivitiesBookings = await activitiesRepository.findActivitiesBookingByUserId(userId);
  const userActivities = userActivitiesBookings.map( async (booking) => await activitiesRepository.findActivitiesById(booking.activityId));
  const filteredActivities = userActivities.filter(async (uActivities) => activitiy.date === (await uActivities).date);
  const conflict = filteredActivities.filter(async (actv) => (await actv).startsAt <= activitiy.startsAt && (await actv).endsAt >= activitiy.startsAt);
  
  if(activitiy.capacity >= quantityBookings) {
    throw conflictError("Conflict");
  }

  if(conflict.length > 0) {
    throw conflictError("Conflict");
  }

  activitiesRepository.createActivitiesBooking(activityId, userId);
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
      ActivityBooking: ActivityBooking[];
  }[];
});
