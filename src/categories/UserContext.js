import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

// Hook
export const useUser = () => useContext(UserContext);

// Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /* ---------------- LOAD USER FROM TOKEN ---------------- */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          localStorage.removeItem("token");
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  /* ---------------- LOGOUT ---------------- */

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  /* ---------------- UPDATE USERNAME ---------------- */

  const updateUserName = async (newName) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/auth/update-name`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newName }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.msg || "Failed to update username");
    }

    // Sync frontend user with backend
    setUser(data.user);

    return data.user;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        updateUserName,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
