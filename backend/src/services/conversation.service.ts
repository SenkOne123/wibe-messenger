import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrGetConversation = async (userId: string, participantId: string) => {
  // Check if conversation already exists between these two users
  const existingConversations = await prisma.conversation.findMany({
    where: {
      AND: [
        { users: { some: { id: userId } } },
        { users: { some: { id: participantId } } }
      ]
    },
    include: {
      users: { select: { id: true, username: true } },
    }
  });

  const conversation = existingConversations.find(c => c.users.length === 2);

  if (conversation) {
    return conversation;
  }

  // Create new conversation
  return prisma.conversation.create({
    data: {
      users: {
        connect: [{ id: userId }, { id: participantId }]
      }
    },
    include: {
      users: { select: { id: true, username: true } }
    }
  });
};

export const getUserConversations = async (userId: string) => {
  return prisma.conversation.findMany({
    where: {
      users: {
        some: { id: userId }
      }
    },
    include: {
      users: { select: { id: true, username: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
};

export const getConversationMessages = async (conversationId: string, userId: string) => {
  // Ensure user is part of conversation
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, users: { some: { id: userId } } }
  });
  if (!conv) throw new Error('Not authorized or not found');

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, username: true } } }
  });
};

export const createMessage = async (conversationId: string, senderId: string, text: string) => {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, users: { some: { id: senderId } } },
    include: { users: true }
  });
  
  if (!conv) throw new Error('Not authorized or not found');

  const message = await prisma.message.create({
    data: {
      text,
      senderId,
      conversationId,
    },
    include: { sender: { select: { id: true, username: true } } }
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  return { message, users: conv.users };
};
