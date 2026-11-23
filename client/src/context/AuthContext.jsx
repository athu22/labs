import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('mockUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('mockUserData');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleUser(session?.user);
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await handleUser(session?.user);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUser = async (user) => {
    if (user) {
      setCurrentUser(user);
      const { data: userDoc, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();
        
      if (userDoc) {
        setUserData(userDoc);
      }
    } else {
      // Only clear if we're NOT in mock mode
      if (!localStorage.getItem('mockUser')) {
        setCurrentUser(null);
        setUserData(null);
      }
    }
  };

  const login = (user, data) => {
    setCurrentUser(user);
    setUserData(data);
    localStorage.setItem('mockUser', JSON.stringify(user));
    localStorage.setItem('mockUserData', JSON.stringify(data));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserData(null);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockUserData');
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
