import express from 'express';
import {
  getProfile,
  getTest,
  login,
  register,
} from '../controllers/controllers';

const router = express.Router();

router.get('/test', getTest);

router.get('/profile', getProfile);

router.post('/register', register);

router.post('/login', login);

export default router;
