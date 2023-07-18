import axios from 'axios';
import { ReactNode, createContext, useEffect, useState } from 'react';
import { UserType } from '../types/userType';

interface Props {
  children: ReactNode | ReactNode[];
}

export interface UserContextType {
  username: string | null;
  setUsername: (value: string | null) => void;
  id: string | null;
  setId: (value: string | null) => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export function UserContextProvider({ children }: Props) {
  const [username, setUsername] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<UserType>('/profile')
      .then((res) => {
        setId(res.data.userId!);
        setUsername(res.data.username);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <UserContext.Provider value={{ username, setUsername, id, setId }}>
      {children}
    </UserContext.Provider>
  );
}
