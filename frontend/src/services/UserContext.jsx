import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "./newsApi";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  });

  // Verify session on mount to prevent localStorage spoofing
  useEffect(() => {
    const verifySession = async () => {
      try {
        const data = await getCurrentUser();
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("Session verification failed:", err);
        setUser(null);
        localStorage.removeItem("user");
      }
    };
    verifySession();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  return useContext(UserContext);
}