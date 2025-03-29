import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for scriptocol cookie on mount
        const scriptocolCookie = Cookies.get('scriptocol');
        setIsAuthenticated(!!scriptocolCookie);
    }, []);

    const login = () => {
        const userId = Math.random().toString(36).substring(7);
        Cookies.set('scriptocol', userId, { expires: 7 });
        setIsAuthenticated(true);
    };

    const logout = () => {
        Cookies.remove('scriptocol');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 