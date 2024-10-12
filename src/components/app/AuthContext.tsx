"use client";
import React, { createContext, useState, useContext } from "react";
import { verifyToken } from "@/lib/serverUtils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
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
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername("");
    setId(0);
    setIdCesta(Math.floor(Math.random() * 1000000));
    localStorage.removeItem("user");
    router.push("/login");
  }, [router]);

  useEffect(() => {
    setLoading(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Verify the token with the server
      verifyToken(user.token).then((result: { valid: boolean; payload?: any }) => {
        if (result.valid) {
          console.log("Token válido");
          setIsLoggedIn(true);
          setUsername(user.username);
          setId(user.id);
          setLoading(false);
        } else {
          console.log("Token inválido");
          logout();
          setLoading(false);
        }
      });
    }
    // Verify the token with the server
   
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        idCesta,
        setIdCesta,
        isLoggedIn,
        username,
        id,
        setIsLoggedIn,
        setUsername,
        setId,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
