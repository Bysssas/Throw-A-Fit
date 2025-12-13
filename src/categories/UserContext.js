import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

// Named export for the hook
export const useUser = () => useContext(UserContext);

// Named export for the provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.warn("Failed /auth/me:", res.status);
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

  // --- LOGOUT ---
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // --- UPDATE USERNAME ---
  const updateUserName = async (newName) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-name`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.msg || "Failed to update username");
      }

      const updatedUser = await res.json();

      // Sync frontend with backend result
      setUser(updatedUser);

      return true;
    } catch (err) {
      console.error("Failed to update username:", err);
      throw err;
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, updateUserName }}>
      {children}
    </UserContext.Provider>
  );
};
