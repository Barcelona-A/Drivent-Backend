import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { customerNotTicket, customerNotPayment } from "@/errors/cannot-list-hotels-error";
import { ticketIsRemote } from "@/errors/ticket-is-remote-error";
import activitiesRepository from "@/repositories/activities-repository";
import { Activity, Local, ActivityBooking } from "@prisma/client";
import { invalidDataError } from "@/errors";
import { DateType, Hash } from "@/protocols";

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

  const allDates = listActivitiesDate.map(value => {
    return value.date.toUTCString();
  });
  
  return extractDates(allDates);
}

function extractDates(allDates: DateType) {
  const hashDates: Hash = {};

  for (const i in allDates) {
    if (hashDates[allDates[i]]) continue;

    hashDates[allDates[i]] = true;
  }

  const differentDates = Object.keys(hashDates);

  return differentDates;
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

const activitiesService = {
  getActivities,
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
