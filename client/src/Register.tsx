/* eslint-disable @typescript-eslint/no-misused-promises */
import { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext, UserContextType } from './contexts/UserContext';

const RegisterAndLoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('register');
  const { setUsername: setLoggedInUsername, setId } = useContext(
    UserContext
  ) as UserContextType;

  interface RegisterProps {
    id: string;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();

    const url = isLoginOrRegister === 'register' ? '/register' : '/login';
    const { data } = await axios.post<RegisterProps>(url, {
      username,
      password,
    });

    setLoggedInUsername(username);
    setId(data.id);
  }

  return (
    <div className='bg-blue-50 h-screen flex items-center'>
      <form className='w-64 mx-auto mb-12' onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='username'
          className='block w-full rounded-sm p-2 mb-2 border'
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
        />
        <input
          type='password'
          placeholder='password'
          className='block w-full rounded-sm p-2 mb-2 border'
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
        />
        <button className='bg-blue-500 text-white block w-full round-sm p-2'>
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
        </button>
        <div className='text-center mt-2'>
          {isLoginOrRegister === 'register' && (
            <div>
              Already a member?
              <button
                onClick={() => setIsLoginOrRegister('login')}
                className='ps-1'
              >
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === 'login' && (
            <div>
              Don't have an account?
              <button onClick={() => setIsLoginOrRegister('register')}>
                Register here
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterAndLoginForm;
