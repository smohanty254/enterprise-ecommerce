export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
}

export interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}
