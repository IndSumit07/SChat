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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if stored token is still valid on app start
    useEffect(() => {
        const validateStoredAuth = async () => {
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (storedToken && storedUser) {
                try {
                    console.log("Validating stored authentication...");
                    // Verify token with server
                    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
                        method: 'GET',
                        headers: {
                            'token': storedToken
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            console.log("Stored authentication is valid, restoring session");
                            setUser(JSON.parse(storedUser));
                            setToken(storedToken);
                            setIsAuthenticated(true);
                        } else {
                            console.log("Stored authentication is invalid, clearing storage");
                            // Token invalid, clear storage
                            localStorage.removeItem("user");
                            localStorage.removeItem("token");
                            setUser(null);
                            setToken(null);
                            setIsAuthenticated(false);
                        }
                    } else {
                        console.log("Token verification failed, clearing storage");
                        // Token invalid, clear storage
                        localStorage.removeItem("user");
                        localStorage.removeItem("token");
                        setUser(null);
                        setToken(null);
                        setIsAuthenticated(false);
                    }
                } catch (error) {
                    console.error("Auth validation error:", error);
                    // On error, clear storage to be safe
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    setUser(null);
                    setToken(null);
                    setIsAuthenticated(false);
                }
            } else {
                console.log("No stored authentication found");
            }
        };

        validateStoredAuth();
    }, []);

    // manage socket connection
    useEffect(() => {
        if (user?._id && isAuthenticated) {
            const s = ioClient(API_BASE_URL, {
                query: { userId: user._id },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            setSocket(s);

            s.on("connect", () => {
                console.log("Socket connected");
            });

            s.on("disconnect", () => {
                console.log("Socket disconnected");
            });

            s.on("getOnlineUsers", (users) => setOnlineUsers(users));

            return () => {
                s.disconnect();
                setSocket(null);
            };
        }
    }, [user?._id, isAuthenticated]);

    const login = useCallback((userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", jwtToken);
    }, []);

    const updateUser = useCallback((updatedUserData) => {
        setUser(updatedUserData);
        localStorage.setItem("user", JSON.stringify(updatedUserData));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        setOnlineUsers([]);
    }, [socket]);

    const value = useMemo(
        () => ({ user, token, socket, onlineUsers, login, logout, updateUser, isAuthenticated }),
        [user, token, socket, onlineUsers, login, logout, updateUser, isAuthenticated]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


