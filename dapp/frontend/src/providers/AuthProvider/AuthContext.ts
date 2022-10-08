import { createContext } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { User } from '~/api';

export type AuthContextValue = {
  authClient?: AuthClient;
  logout?: () => void;
  isAuthenticated?: boolean;
  checkAuthentication?: () => void;
  user?: User;
  setUser?: (e: User) => void;
};
export const AuthContext = createContext<AuthContextValue>({});
