import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthState({
        isAuthenticated: true,
        token,
        isLoading: false,
      });
    } else {
      setAuthState({
        isAuthenticated: false,
        token: null,
        isLoading: false,
      });
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setAuthState({
      isAuthenticated: true,
      token,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({
      isAuthenticated: false,
      token: null,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
