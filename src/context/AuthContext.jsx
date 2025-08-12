import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    user: null, // Added user to auth state
    isLoading: true,
  });

  const fetchUserData = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const user = await fetchUserData(token);
        setAuthState({
          isAuthenticated: true,
          token,
          user,
          isLoading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          token: null,
          user: null,
          isLoading: false,
        });
      }
    };
    initializeAuth();
  }, []);

  const login = async (token) => {
    const user = await fetchUserData(token);
    localStorage.setItem("token", token);
    setAuthState({
      isAuthenticated: true,
      token,
      user,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
      isLoading: false,
    });
  };

  const setUser = (userData) => {
    setAuthState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        ...userData,
      },
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        setUser, // Added setUser to context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
