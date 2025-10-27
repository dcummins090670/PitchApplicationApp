import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();



export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  // From the return result (res.json) from backend login.js, we get token and user props
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check localStorage on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) {
      setToken(storedToken);
        
    }
    
  // in case local storage holds user as undefined.
        try {
          if (storedUser && storedUser !== 'undefined') {
            setUser(JSON.parse(storedUser));
          }

        } catch (error) {
          console.error('Failed to parse storedUser:', error);
          localStorage.removeItem('user'); // Clear corrupted entry
        }
          
//*3 include this
//    if (storedUser) {
//     setUser(JSON.parse(storedUser));
//   }

  }, []);

  
  function login(newToken, newUser) {
    setToken(newToken);
    setUser(newUser);
    // Save to localStorage so it survives refresh
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

  }

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}



/*
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);


  // From the return result (res.json) from backend login.js, we get token and user props
      // const [user, setUser] = useState(null);

  useEffect(() => {
    // Check localStorage on app load
    const storedToken = localStorage.getItem('token');
          //const storedUser = localStorage.getItem('user');
    if (storedToken) {
      setToken(storedToken);
    }

   
// in case local storage holds user as undefined.
      
        try {
          if (storedUser && storedUser !== 'undefined') {
            setUser(JSON.parse(storedUser));
          }

        } catch (error) {
          console.error('Failed to parse storedUser:', error);
          localStorage.removeItem('user'); // Clear corrupted entry
        }

    //if (storedUser) {
    //  setUser(JSON.parse(storedUser));
    //}
    
  }, []);
    
  
  function login(newToken) {
    localStorage.setItem('token', newToken);
    
    setToken(newToken);
    
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);

  }

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

*/