import { createContext } from 'react';
import { type AuthContextProps } from '../types/auth';

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);
