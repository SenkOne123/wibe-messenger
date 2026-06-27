import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const searchUsers = async (query: string, excludeUserId: string) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
    },
  });
  
  const lowerQuery = query.toLowerCase();
  return users
    .filter(u => u.id !== excludeUserId && u.username.toLowerCase().includes(lowerQuery))
    .slice(0, 20);
};
