import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        // Only clear if we're NOT in mock mode
        if (!localStorage.getItem('mockUser')) {
          setCurrentUser(null);
          setUserData(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (user, data) => {
    setCurrentUser(user);
    setUserData(data);
    localStorage.setItem('mockUser', JSON.stringify(user));
    localStorage.setItem('mockUserData', JSON.stringify(data));
  };

  const logout = async () => {
    await auth.signOut();
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
