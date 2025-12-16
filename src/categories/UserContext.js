import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

// Hook
export const useUser = () => useContext(UserContext);

// Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  /* ======================
     LOAD USER FROM TOKEN
  ====================== */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  }, [API_URL]);

  /* ======================
     LOGOUT
  ====================== */

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  /* ======================
     UPDATE USERNAME
  ====================== */

  const updateUserName = async (newName) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/auth/update-name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: newName }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.msg || "Failed to update username");
    }

    setUser(data.user);
    return data.user;
  };

  /* ======================
     DELETE ACCOUNT
  ====================== */

  const deleteAccount = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/auth/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.msg || "Failed to delete account");
    }

    // Clear local state on success
    localStorage.removeItem("token");
    setUser(null);

    return data.msg;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        updateUserName,
        deleteAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
