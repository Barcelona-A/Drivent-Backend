import { prisma } from "@/config";
import { Payment } from "@prisma/client";
import { TicketStatus } from "@prisma/client";

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId,
    }
  });
}

async function createPayment(ticketId: number, params: PaymentParams) {
  return prisma.payment.create({
    data: {
      ticketId,
      ...params,
    }
  });
}

async function createAndProcessPayment(ticketId: number, params: PaymentParams) {
  const createPayment = prisma.payment.create({
    data: {
      ticketId,
      ...params,
    }
  });
  const processPayment = prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: TicketStatus.PAID,
    }
  });

  return prisma.$transaction([createPayment, processPayment]);
}

export type PaymentParams = Omit<Payment, "id" | "createdAt" | "updatedAt">

const paymentRepository = {
  findPaymentByTicketId,
  createPayment,
  createAndProcessPayment,
};

export default paymentRepository;
