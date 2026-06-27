import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as userService from '../services/user.service';

export const searchUsersHandler = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.username as string;
    const currentUserId = req.user.userId;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await userService.searchUsers(query, currentUserId);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
