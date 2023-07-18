import { useContext, useEffect, useRef, useState } from 'react';
import {
  UserType,
  WebSocketMessageType,
  WebSocketUserType,
} from './types/userType';
import Contact from './components/Contact';
import Logo from './components/Logo';
import { UserContext, UserContextType } from './contexts/UserContext';
import axios from 'axios';

const Chat = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<UserType[]>([]);
  const [offlineUsers, setOfflineUsers] = useState<UserType[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { username, id, setId, setUsername } = useContext(
    UserContext
  ) as UserContextType;
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [messages, setMessages] = useState<WebSocketMessageType[]>([]);
  const divUnderMessages = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket('ws://localhost:3000');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log('Disconnected. Trying to reconnect.');
        connectToWs();
      }, 1000);
    });
  }

  function handleMessage(ev: MessageEvent<string>) {
    const messageData = JSON.parse(ev.data) as
      | WebSocketUserType
      | WebSocketMessageType;
    if ('online' in messageData) {
      console.log(messageData);
      showOnlineUsers(messageData.online);
    } else {
      setMessages((prev) => [...prev, messageData]);
    }
  }

  function logout() {
    axios
      .post('/logout')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then((_) => {
        setWs(null);
        setId(null);
        setUsername(null);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function sendMessage(ev: React.FormEvent) {
    ev.preventDefault();
    if (!ws) return;

    ws.send(
      JSON.stringify({
        message: {
          recipient: selectedUserId,
          text: newMessageText,
        },
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        sender: id || 'none',
        recipient: selectedUserId || '',
        text: newMessageText,
        _id: Date.now().toString(),
      },
    ]);
    setNewMessageText('');
  }

  function showOnlineUsers(usersArray: UserType[]) {
    const users: { [key: string]: string } = {};
    usersArray.forEach(({ _id, username }) => {
      users[_id] = username;
    });

    const usersObj: UserType[] = [];
    for (const [key, value] of Object.entries(users)) {
      usersObj.push({ _id: key, username: value });
    }
    setOnlineUsers(usersObj);
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    div?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (!selectedUserId) return;

    axios
      .get<WebSocketMessageType[]>('/messages/' + selectedUserId)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [selectedUserId]);

  useEffect(() => {
    axios
      .get<UserType[]>('/users')
      .then((res) => {
        const offlineUsers = res.data
          .filter((user) => user._id !== id)
          .filter((user) => !onlineUsers.map((u) => u._id).includes(user._id));
        setOfflineUsers(offlineUsers);
      })

      .catch((err) => {
        console.error(err);
      });
  }, [onlineUsers]);

  const onlinePeopleExcludingMe = onlineUsers.filter(
    (user) => user.username !== username
  );

  const uniqueIds = new Set<string>();
  const messagesWithoutDuplications = messages.filter((message) => {
    if (uniqueIds.has(message._id)) {
      return false;
    } else {
      uniqueIds.add(message._id);
      return true;
    }
  });

  return (
    <div className='flex h-screen'>
      <div className='bg-white w-1/3 flex flex-col'>
        <div className='flex-grow'>
          <Logo />
          {onlinePeopleExcludingMe.map(({ _id, username }) => (
            <Contact
              key={_id}
              userId={_id}
              username={username}
              onClick={setSelectedUserId}
              isSelected={_id === selectedUserId}
              online={true}
            />
          ))}
          {offlineUsers.map(({ _id, username }) => (
            <Contact
              key={_id}
              userId={_id}
              username={username}
              onClick={setSelectedUserId}
              isSelected={_id === selectedUserId}
              online={false}
            />
          ))}
        </div>
        <div className='p-2 text-center'>
          <span className='mr-2 text-sm text-gray-600'>Hello {username}</span>
          <button
            onClick={logout}
            className='text-sm bg-blue-100 py-1 px-2 border rounded-sm text-gray-500'
          >
            Logout
          </button>
        </div>
      </div>
      <div className='flex flex-col bg-blue-50 w-2/3 p-2'>
        <div className='flex-grow'>
          {!selectedUserId && (
            <div className='flex h-full items-center justify-center'>
              <div className='text-gray-400'>
                &larr; Select a user from the sidebar
              </div>
            </div>
          )}
          {selectedUserId && (
            <div className='relative h-full'>
              <div className='overflow-y-scroll absolute inset-0'>
                {messagesWithoutDuplications.map(({ _id, text, sender }) => (
                  <div
                    key={_id}
                    className={sender === id ? 'text-right' : 'text-left'}
                  >
                    <div
                      className={
                        'text-left inline-block p-2 my-2 rounded-md text-sm ' +
                        (sender === id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-500')
                      }
                    >
                      {text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form className='flex gap-2' onSubmit={sendMessage}>
            <input
              type='text'
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder='Type your message here'
              className='bg-white flex-grow border p-2 rounded-sm'
            />
            <button className='bg-blue-500 p-2 text-white rounded-sm'>
              SEND
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
