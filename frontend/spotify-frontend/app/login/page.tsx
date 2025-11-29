"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Music2, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, authError, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/profile");      
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-dark opacity-50" />

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand rounded-full mb-4 shadow-custom-lg">
            <Music2 className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-secondary">Sign in to continue listening</p>
        </div>

        {/* Login Card */}
        <div className="bg-secondary p-8 rounded-2xl shadow-custom-xl border border-default">
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-elevated text-primary 
                           border border-default outline-none 
                           focus:border-primary focus:ring-2 focus:ring-primary/20
                           transition-all duration-200 placeholder:text-muted"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-elevated text-primary 
                           border border-default outline-none 
                           focus:border-primary focus:ring-2 focus:ring-primary/20
                           transition-all duration-200 placeholder:text-muted"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-default bg-elevated 
                           text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-secondary">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-primary hover:text-primary-hover transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              onClick={submit}
              disabled={loginLoading}
              className="w-full bg-button text-black font-bold py-3.5 rounded-lg 
                       hover:bg-primary-hover hover-lift
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
                       shadow-custom-md hover:shadow-custom-lg
                       transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-divider"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-secondary text-muted">OR</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button className="w-full py-3 px-4 border border-default rounded-lg bg-tertiary
                             hover:bg-elevated transition-colors duration-200
                             flex items-center justify-center gap-3 text-primary font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-secondary mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:text-primary-hover font-semibold transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}