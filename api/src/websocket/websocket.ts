import ws from 'ws';
import jwt from 'jsonwebtoken';
import { UserType } from '../types/userType';

interface CustomConnection extends ws {
  userId: string;
  username: string;
}

function broadcastAllUsers(wss: ws.Server) {
  Array.from(wss.clients).forEach((client: any) => {
    const customClient = client as CustomConnection;
    customClient.send(
      JSON.stringify(
        Array.from(wss.clients).map((client: any) => {
          const customClient = client as CustomConnection;
          return {
            userId: customClient.userId,
            username: customClient.username,
          };
        })
      )
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
    customConnection.userId = userId;
    customConnection.username = username;

    console.log('CONNECTION');

    // Broadcast to all connected clients
    broadcastAllUsers(wss);
  });
}

export default wssConnection;
