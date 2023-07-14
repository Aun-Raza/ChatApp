import { useEffect, useState } from 'react';
import { UserType } from './types/userType';

const Chat = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<UserType[]>([]);
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
  }, []);

  function handleMessage(ev: MessageEvent<string>) {
    const onlineUsers = JSON.parse(ev.data) as UserType[];
    showOnlineUsersNoDuplications(onlineUsers);
    return;
  }

  function showOnlineUsersNoDuplications(usersArray: UserType[]) {
    const users: { [key: string]: string } = {};
    usersArray.forEach(({ userId, username }) => {
      users[userId] = username;
    });

    const usersObj: UserType[] = [];
    for (const [key, value] of Object.entries(users)) {
      usersObj.push({ userId: key, username: value });
    }
    setOnlineUsers(usersObj);
  }

  return (
    <div className='flex h-screen'>
      <div className='bg-white w-1/3 p-2'>
        <div className='text-blue-600 font-bold'>ChatSphere</div>
        {onlineUsers.map((user) => (
          <div className='border-b border-gray-100 py-2'>{user.username}</div>
        ))}
      </div>
      <div className='flex flex-col bg-blue-50 w-2/3 p-2'>
        <div className='flex-grow'>Messages with selected person</div>
        <div className='flex gap-2'>
          <input
            type='text'
            placeholder='Type your message here'
            className='bg-white flex-grow border p-2 rounded-sm'
          />
          <button className='bg-blue-500 p-2 text-white rounded-sm'>
            SEND
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
