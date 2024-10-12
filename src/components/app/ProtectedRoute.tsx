// src/components/ProtectedRoute.js
"use client";

import { useAuth } from "@/components/app/AuthContext";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { username, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(" usuario: ", username);
    if (!username && !loading) {
      router.push("/login");
    }
  }, [username, loading, router]);

  if (loading) return null;

  return username ? children : null;
};

export default ProtectedRoute;
