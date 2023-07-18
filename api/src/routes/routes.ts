import express from 'express';
import {
  getProfile,
  getMessages,
  getUsers,
  login,
  register,
  logout,
} from '../controllers/controllers';

const router = express.Router();

router.get('/profile', getProfile);

router.get('/users', getUsers);

router.get('/messages/:userId', getMessages);

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

export default router;
