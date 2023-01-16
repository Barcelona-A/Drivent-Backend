import { prisma } from "@/config";
import { Prisma } from "@prisma/client";

async function findByEmail(email: string, select?: Prisma.UserSelect) {
  const params: Prisma.UserFindUniqueArgs = {
    where: {
      email,
    },
  };

  if (select) {
    params.select = select;
  }

  return prisma.user.findUnique(params);
}

async function findByEmailGitHub(email: string) {
  return prisma.user.findUnique({
    where: { email }
  });
}

async function createByGitHubData(email: string, accessToken: string) {
  return prisma.user.create({
    data: {
      email,
      password: accessToken.substring(0, 200)
    }
  });
}

async function create(data: Prisma.UserUncheckedCreateInput) {
  return prisma.user.create({
    data,
  });
}

const userRepository = {
  findByEmail,
  findByEmailGitHub,
  create,
  createByGitHubData
};

export default userRepository;
