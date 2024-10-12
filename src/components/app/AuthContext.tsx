"use client"
import React, { createContext, useState, useContext } from 'react';

export interface AuthContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    username: string;

    setUsername: React.Dispatch<React.SetStateAction<string>>;
    id: number;
    setId: React.Dispatch<React.SetStateAction<number>>;
    logout: () => void;
    idCesta: number;
    setIdCesta: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [id, setId] = useState(0);
    const [idCesta, setIdCesta] = useState(Math.floor(Math.random() * 1000000));

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setIsLoggedIn(true);
            setUsername(user.username);
            setId(user.id);
        }
    }, []);
    
    const logout = () => {
        setIsLoggedIn(false);
        setUsername("");
        setId(0);
        setIdCesta(Math.floor(Math.random() * 1000000));
    };
    return (
        <AuthContext.Provider value= {{ idCesta, setIdCesta, isLoggedIn, username, id, setIsLoggedIn, setUsername, setId, logout }}>
    { children }
    </AuthContext.Provider>
    );
  }