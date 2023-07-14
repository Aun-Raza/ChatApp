import { useContext } from 'react';
import RegisterAndLoginForm from './Register';
import { UserContext, UserContextType } from './contexts/UserContext';
import Chat from './Chat';

const Routes = () => {
  const { username } = useContext(UserContext) as UserContextType;

  if (username) {
    return <Chat />;
  }

  return <RegisterAndLoginForm />;
};

export default Routes;
