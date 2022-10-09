import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useNavigate } from 'react-router-dom';
import { call, setIdentity, User } from '~/api';
import {
  AuthContext,
  AuthContextValue,
} from '~/providers/AuthProvider/AuthContext';

export function AuthProvider(props: PropsWithChildren) {
  const { children } = props;
  const [value, setValue] = useState<AuthContextValue>({});
  const navigate = useNavigate();
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!initialLoadRef.current) {
      return;
    }
    initialLoadRef.current = false;
    let res: AuthContextValue;
    AuthClient.create()
      .then((authClient) => {
        setIdentity(authClient);
        const logout = async () => {
          await authClient.logout();
          navigate('/');
          setValue((prValue) => ({
            ...prValue,
            isAuthenticated: false,
            user: undefined,
          }));
        };
        const checkAuthentication = async () => {
          const isAuthenticated = await authClient.isAuthenticated();
          setValue((prValue) => ({ ...prValue, isAuthenticated }));
        };
        const setUser = (user: User) =>
          setValue((prValue) => ({ ...prValue, user }));
        res = { authClient, logout, checkAuthentication, setUser };
        return authClient.isAuthenticated();
      })
      .then((isAuthenticated) => {
        setValue({ ...res, isAuthenticated });
        return call('getUser');
      })
      .then((user) => setValue((prValue) => ({ ...prValue, user })));
  }, [navigate]);

  return (
    <AuthContext.Provider value={value}>
      {value.authClient && children}
    </AuthContext.Provider>
  );
}
