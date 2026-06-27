import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const searchUsers = async (query: string, excludeUserId: string) => {
  return prisma.user.findMany({
    where: {
      username: {
        contains: query,
      },
      id: {
        not: excludeUserId,
      },
    },
    select: {
      id: true,
      username: true,
    },
    take: 20,
  });
};
