import { prisma } from "@/config";

async function findActivities(date: any) {
  return prisma.activity.findMany({
    where: { date }
  });
}

async function findActivitiesDate() {
  return prisma.activity.findMany({
    select: { date: true }
  });
}

const activitiesRepository = {
  findActivities,
  findActivitiesDate
};

export default activitiesRepository;
