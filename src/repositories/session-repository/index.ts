import { prisma } from "@/config";
import { Prisma } from "@prisma/client";

async function create(data: Prisma.SessionUncheckedCreateInput) {
  return prisma.session.create({
    data,
  });
}
async function createWithAccessToken(userId: number, token: string) {
  return prisma.session.create({
    data: {
      userId,
      token
    }
  });
}

const sessionRepository = {
  create,
  createWithAccessToken
};

export default sessionRepository;
