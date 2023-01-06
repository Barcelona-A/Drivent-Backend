import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { customerNotTicket, customerNotPayment } from "@/errors/cannot-list-hotels-error";
import { ticketIsRemote } from "@/errors/ticket-is-remote-error";
import activitiesRepository from "@/repositories/activities-repository";
import { Activity } from "@prisma/client";

async function getActivities(userId: number, activityDate: string | undefined): Promise<string[] | Activity[]> {
  await checkTicketIsRemote(userId);

  if (activityDate) {
    const date = new Date(activityDate);
    return activitiesRepository.findActivities(date);
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

const activitiesService = {
  getActivities
};

export default activitiesService;
