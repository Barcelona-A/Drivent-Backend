import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { customerNotTicket, customerNotPayment } from "@/errors/cannot-list-hotels-error";
import { ticketIsRemote } from "@/errors/ticket-is-remote-error";
import activitiesRepository from "@/repositories/activities-repository";

async function getActivities(userId: number) {
  await checkTicketIsRemote(userId);
  return activitiesRepository.findActivities();
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
}

const activitiesService = {
  getActivities
};

export default activitiesService;
