import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const { JWT_SECRET } = process.env;
import bcrypt from 'bcryptjs';
import { UserType } from '../types/userType';
import MessageModel from '../models/MessageModel';
const bcryptSalt = bcrypt.genSaltSync(10);

export function getProfile(req: Request, res: Response) {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, JWT_SECRET || '', {}, (err, userData) => {
    if (err) throw err;
    res.json(userData);
  });
}

async function getUserData(req: Request) {
  return new Promise((resolve, reject) => {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, JWT_SECRET || '', {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject({ error: 'Unauthorized' });
    }
  });
}

export async function getUsers(req: Request, res: Response) {
  const users = await UserModel.find({}, { _id: 1, username: 1 });
  res.json(users);
}

export async function getMessages(req: Request, res: Response) {
  const { userId } = req.params;
  const userData = (await getUserData(req)) as UserType;
  const messages = await MessageModel.find({
    sender: { $in: [userData.userId, userId] },
    recipient: { $in: [userData.userId, userId] },
  }).sort({ createdAt: 1 });

  res.json(messages);
}

export async function register(req: Request, res: Response) {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hashSync(password, bcryptSalt);
  const createdUser = await UserModel.create({
    username,
    password: hashedPassword,
  });
  const token = jwt.sign(
    { userId: createdUser._id, username },
    JWT_SECRET || ''
  );
  if (!token) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  res
    .cookie('token', token, { sameSite: 'none', secure: true })
    .status(201)
    .json({ id: createdUser });
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  const foundUser = await UserModel.findOne({ username });
  if (!foundUser) return res.status(400).json({ error: 'Invalid credentials' });

  const passOk = bcrypt.compareSync(password, foundUser.password);
  if (!passOk) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: foundUser._id, username }, JWT_SECRET || '');
  if (!token) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  res
    .cookie('token', token, { sameSite: 'none', secure: true })
    .status(201)
    .json({ id: foundUser });
}

export async function logout(req: Request, res: Response) {
  res.cookie('token', '', { sameSite: 'none', secure: true }).json('ok');
}
