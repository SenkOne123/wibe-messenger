import { Router } from 'express';
import { 
  createOrGetConversationHandler, 
  getUserConversationsHandler, 
  getConversationMessagesHandler, 
  createMessageHandler 
} from '../controllers/conversation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createOrGetConversationHandler);
router.get('/', getUserConversationsHandler);
router.get('/:id/messages', getConversationMessagesHandler);
router.post('/:id/messages', createMessageHandler);

export default router;
