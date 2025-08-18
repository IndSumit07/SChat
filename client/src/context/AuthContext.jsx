import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { io as ioClient } from "socket.io-client";

export const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // manage socket connection
    useEffect(() => {
        if (user?._id) {
            const s = ioClient(API_BASE_URL, {
                query: { userId: user._id },
            });
            setSocket(s);

            s.on("getOnlineUsers", (users) => setOnlineUsers(users));
            return () => {
                s.disconnect();
                setSocket(null);
            };
        }
    }, [user?._id]);

    const login = useCallback((userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", jwtToken);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        if (socket) socket.disconnect();
    }, [socket]);

    const value = useMemo(
        () => ({ user, token, socket, onlineUsers, login, logout }),
        [user, token, socket, onlineUsers, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


