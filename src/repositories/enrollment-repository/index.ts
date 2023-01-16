import { prisma } from "@/config";
import { Enrollment, PrismaClient } from "@prisma/client";
import { CreateAddressParams, UpdateAddressParams } from "../address-repository";

async function findWithAddressByUserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      Address: true,
    },
  });
}

async function findById(enrollmentId: number) {
  return prisma.enrollment.findFirst({
    where: { id: enrollmentId }
  });
}

async function upsert(
  userId: number,
  createdEnrollment: CreateEnrollmentParams,
  updatedEnrollment: UpdateEnrollmentParams,
) {
  return prisma.enrollment.upsert({
    where: {
      userId,
    },
    create: createdEnrollment,
    update: updatedEnrollment,
  });
}

async function upsertEnrollmentAndAddress(
  userId: number,
  createdEnrollment: CreateEnrollmentParams,
  updatedEnrollment: UpdateEnrollmentParams,
  createdAddress: CreateAddressParams, 
  updatedAddress: UpdateAddressParams,
) {
  return await prisma.$transaction(async (tx: PrismaClient) => {
    const newEnrollment: Enrollment = await tx.enrollment.upsert({
      where: {
        userId,
      },
      create: createdEnrollment,
      update: updatedEnrollment,
    });

    return await tx.address.upsert({
      where: {
        enrollmentId: newEnrollment.id,
      },
      create: {
        ...createdAddress,
        Enrollment: { connect: { id: newEnrollment.id } },
      },
      update: updatedAddress,
    });
  });
}

export type CreateEnrollmentParams = Omit<Enrollment, "id" | "createdAt" | "updatedAt">;
export type UpdateEnrollmentParams = Omit<CreateEnrollmentParams, "userId">;

const enrollmentRepository = {
  findWithAddressByUserId,
  upsert,
  findById,
  upsertEnrollmentAndAddress,
};

export default enrollmentRepository;
