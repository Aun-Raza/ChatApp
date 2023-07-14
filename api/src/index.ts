import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/routes';
dotenv.config();
const { CLIENT_URL } = process.env;
import cookieParser from 'cookie-parser';

import './db/mongodb'; // Connect to MongoDB
const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(router);

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
