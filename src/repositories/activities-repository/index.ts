import { prisma } from "@/config";

async function findActivities() {
  return ["activity1", "activity2"];
}

const activitiesRepository = {
  findActivities
};

export default activitiesRepository;
