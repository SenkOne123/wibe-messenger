import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as conversationService from '../services/conversation.service';
import { getIO } from '../socket';

export const createOrGetConversationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.userId;

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    const conversation = await conversationService.createOrGetConversation(userId, participantId);
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUserConversationsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const conversations = await conversationService.getUserConversations(userId);
    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getConversationMessagesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const messages = await conversationService.getConversationMessages(id, userId);
    return res.status(200).json(messages);
  } catch (error: any) {
    if (error.message === 'Not authorized or not found') return res.status(403).json({ error: error.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createMessageHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const { message, users } = await conversationService.createMessage(id, userId, text);

    // Broadcast via socket.io to all users in conversation
    const io = getIO();
    users.forEach(u => {
      io.to(u.id).emit('newMessage', message);
    });

    return res.status(201).json(message);
  } catch (error: any) {
    if (error.message === 'Not authorized or not found') return res.status(403).json({ error: error.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
