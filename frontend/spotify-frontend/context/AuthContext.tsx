"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { loginUser, getProfile } from "@/lib/auth";

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  _id:string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  authError: any;
  setAuthError: any;
  setToken:any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<any>({})

  // Load token from cookie on first render
  useEffect(() => {
    const storedToken = Cookies.get("accessToken");

    if (storedToken) {
      setToken(storedToken);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login user
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);

      if (data.success == true) {
        const accessToken = data?.data?.token;
        Cookies.set("accessToken", accessToken, { expires: 7 });
        setToken(accessToken);
      }


      if (!data.success) {
        console.log(data)
        throw new Error(data.message || "Invalid credentials");
      
      }
      const profile = await getProfile();
      setUser(profile?.data?.user);

    } catch (error) {
      console.error("Login failed:", error);
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    Cookies.remove("accessToken");
    setUser(null);
    setToken(null);
  };

  // Refresh user profile
  const refreshUser = async () => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) return logout();

    try {
      setToken(accessToken);
      const profile = await getProfile();
      setUser(profile?.data?.user);
    } catch (error) {
      console.error("Profile fetch failed");
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, authError, setAuthError,setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
