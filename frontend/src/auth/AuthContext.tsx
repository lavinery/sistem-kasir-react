import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api'; // Assuming api service is set up

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
            apiService.token = token;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await apiService.login(email, password);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        apiService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
