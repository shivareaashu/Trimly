import { Router } from 'express';
import { handleRegister, handleLogin, handleMe } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.get('/me', authenticate, handleMe);

export default router;
