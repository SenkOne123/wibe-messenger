import { Router } from 'express';
import { searchUsersHandler } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/search', authMiddleware, searchUsersHandler);

export default router;
