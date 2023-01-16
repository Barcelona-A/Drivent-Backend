import { prisma } from "@/config";
import dayjs from "dayjs";

export function createLocal() {
  return prisma.local.create({
    data: {
      name: "Driven Park",
      updatedAt: dayjs().add(1, "hours").toDate(),
    },
  });
}

export function createActivitiesBooking(activityId: number, userId: number) {
  return prisma.activityBooking.create({
    data: {
      activityId,
      userId,
    },
  });
}

export function createActivities(localId: number, eventId: number) {
  return prisma.activity.create({
    data: {
      eventId,
      date: dayjs().toDate(),
      localId,
      name: "Atividade 1",
      startsAt: dayjs().toDate(),
      endsAt: dayjs().add(1, "hours").toDate(),
      duration: 1,
      capacity: 100,
      updatedAt: dayjs().toDate(),
    },
  });
}

export function createActivitiesConflict(localId: number, eventId: number) {
  return prisma.activity.create({
    data: {
      eventId,
      date: dayjs().toDate(),
      localId,
      name: "Atividade 2",
      startsAt: dayjs().toDate(),
      endsAt: dayjs().add(2, "hours").toDate(),
      duration: 1,
      capacity: 10,
      updatedAt: dayjs().toDate(),
    },
  });
}

export function createActivitiesNoCapacity(localId: number, eventId: number) {
  return prisma.activity.create({
    data: {
      eventId,
      date: dayjs("2023-01-18T00:00:00.000Z").toDate(),
      localId,
      name: "Atividade 1",
      startsAt: dayjs().toDate(),
      endsAt: dayjs().add(1, "hours").toDate(),
      duration: 1,
      capacity: 0,
      updatedAt: dayjs().toDate(),
    },
  });
}
