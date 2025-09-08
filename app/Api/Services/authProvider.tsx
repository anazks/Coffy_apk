import React, { useEffect, useState } from 'react';
import { getToken, removeToken, storeToken } from '../utils/Storage';
import AuthContext from './authContext';

// Define the user type (adjust according to your needs)
interface User {
  id?: string;
  email?: string;
  name?: string;
  // Add other user properties as needed
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (token: string, userData: User): Promise<void> => {
    await storeToken(token);
    setUser(userData);
  };

  const logout = async (): Promise<void> => {
    await removeToken();
    setUser(null);
  };

  useEffect(() => {
    const initialize = async () => {
      const token = await getToken();
      if (token) {
        setUser({}); // Optional: fetch user profile with token
      }
      setLoading(false);
    };
    initialize();
  }, []);

  const contextValue = {
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;