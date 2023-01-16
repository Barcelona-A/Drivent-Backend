import { prisma } from "@/config";
import dayjs from "dayjs";
import { Activity } from "@prisma/client";

async function findActivities(date: any) {
  return prisma.activity.findMany({
    where: { date }
  });
}

async function findActivitiesDate() {
  return prisma.activity.findMany({
    orderBy: { date: "asc" },
    select: { date: true }
  });
}

async function findActivitiesWithLocals(date: Date) {
  return prisma.local.findMany({
    include: {
      Activity: {
        where: {
          date: {
            lte: date,
            gt: dayjs(date).subtract(1, "day").toDate(),
          },
        },
        select: {
          id: true,
          name: true,
          date: true,
          startsAt: true,
          endsAt: true,
          capacity: true,
          ActivityBooking: true,          
        }
      },
    },
  });
}

async function findActivitiesById(activityId: number): Promise<Activity> {
  return prisma.activity.findFirst({
    where: {
      id: activityId,
    }
  });
}

const activitiesRepository = {
  findActivities,
  findActivitiesDate,
  findActivitiesWithLocals,
  findActivitiesById
};

export default activitiesRepository;
