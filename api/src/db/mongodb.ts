import dotenv from 'dotenv';
dotenv.config();
const { MONGO_URL } = process.env;
import mongoose from 'mongoose';

mongoose
  .connect(MONGO_URL || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));
