import ws from 'ws';
import jwt from 'jsonwebtoken';
import { UserType } from '../types/userType';
import MessageModel from '../models/MessageModel';

interface CustomConnection extends ws {
  _id: string;
  username: string;
  isAlive: boolean;
  timer: NodeJS.Timer;
  deadTimer: NodeJS.Timeout;
}

interface Message {
  recipient: string;
  text: string;
}

function broadcastAllUsers(wss: ws.Server) {
  Array.from(wss.clients).forEach((client: any) => {
    const customClient = client as CustomConnection;
    customClient.send(
      JSON.stringify({
        online: Array.from(wss.clients).map((client: any) => {
          const customClient = client as CustomConnection;
          return {
            _id: customClient._id,
            username: customClient.username,
          };
        }),
      })
    );
  });
}

function wssConnection(server: any) {
  const wss = new ws.WebSocketServer({ server });
  wss.on('connection', (connection, req) => {
    const cookies = req.headers.cookie;
    if (!cookies) return;

    const tokenCookieString = cookies
      .split(';')
      .find((cookie) => cookie.startsWith('token='));

    if (!tokenCookieString) return;
    const token = tokenCookieString.split('=')[1];
    const userData = jwt.verify(
      token,
      process.env.JWT_SECRET || ''
    ) as UserType;
    const { userId, username } = userData;
    const customConnection = connection as CustomConnection;
    customConnection._id = userId;
    customConnection.username = username;

    customConnection.isAlive = true;
    customConnection.timer = setInterval(() => {
      customConnection.ping();
      customConnection.deadTimer = setTimeout(() => {
        customConnection.isAlive = false;
        customConnection.terminate();
        broadcastAllUsers(wss);
      }, 1000);
    }, 5000);

    connection.on('pong', () => {
      clearTimeout(customConnection.deadTimer);
    });

    // Broadcast to all connected clients
    broadcastAllUsers(wss);

    customConnection.on('message', async (rawMessage) => {
      const { message } = JSON.parse(rawMessage.toString()) as {
        message: Message;
      };
      const { recipient, text } = message;
      if (!recipient || !text) return;

      const messageDoc = await MessageModel.create({
        text,
        recipient,
        sender: customConnection._id,
      });

      Array.from(wss.clients)
        .filter((client: any) => {
          const customClient = client as CustomConnection;
          return customClient._id === recipient;
        })
        .forEach((client: any) => {
          const customClient = client as CustomConnection;
          customClient.send(
            JSON.stringify({
              text,
              recipient,
              sender: customConnection._id,
              _id: messageDoc._id,
            })
          );
        });
    });
  });
}

export default wssConnection;
