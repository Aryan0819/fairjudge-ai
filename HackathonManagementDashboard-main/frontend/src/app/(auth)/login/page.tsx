"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Sparkles, KeyRound } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState("");

  const emailParam = searchParams.get("email");

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailParam || "",
      password: emailParam ? "Password@123" : "",
    }
  });

  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
      setValue("password", "Password@123");
    }
  }, [emailParam, setValue]);

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    try {
      const loggedInUser = await login(data);
      if (!loggedInUser) {
        throw new Error("No user returned");
      }

      const rolePaths: Record<string, string> = {
        participant: "/participant",
        organizer: "/organizer",
        judge: "/judge",
        super_admin: "/super-admin"
      };

      const destination = rolePaths[loggedInUser.role] || "/dashboard-redirect";
      router.replace(destination);
    } catch (err: any) {
      setServerError(err.response?.data?.message || err.message || "Invalid email or password");
    }
  };

  const setDemoRole = (email: string) => {
    setValue("email", email);
    setValue("password", "Password@123");
  };

  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mb-3 shadow-xs">
          <ShieldCheck size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 text-sm mt-1">Sign in to your FairJudge account</p>
      </div>

      {/* Quick Demo Autofill Bar */}
      <div className="mb-6 p-3 bg-slate-50 border rounded-xl">
        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          <KeyRound size={12} className="text-indigo-600" /> Demo Quick Autofill:
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button type="button" onClick={() => setDemoRole("admin@fairjudge.com")} className="p-1.5 bg-white hover:bg-indigo-50 border rounded text-left font-medium text-slate-700 hover:text-indigo-600 transition truncate">
            Super Admin
          </button>
          <button type="button" onClick={() => setDemoRole("organizer1@fairjudge.com")} className="p-1.5 bg-white hover:bg-indigo-50 border rounded text-left font-medium text-slate-700 hover:text-indigo-600 transition truncate">
            Organizer
          </button>
          <button type="button" onClick={() => setDemoRole("judge1@fairjudge.com")} className="p-1.5 bg-white hover:bg-indigo-50 border rounded text-left font-medium text-slate-700 hover:text-indigo-600 transition truncate">
            Judge
          </button>
          <button type="button" onClick={() => setDemoRole("participant1@fairjudge.com")} className="p-1.5 bg-white hover:bg-indigo-50 border rounded text-left font-medium text-slate-700 hover:text-indigo-600 transition truncate">
            Participant
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="p-3 bg-red-50 text-red-700 text-sm font-semibold rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input 
            id="email"
            autoComplete="email"
            {...register("email")}
            type="email" 
            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:outline-none focus:ring-2`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-indigo-600 font-bold hover:underline">
              Forgot password?
            </Link>
          </div>
          <input 
            id="password"
            autoComplete="current-password"
            {...register("password")}
            type="password" 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-100 disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link href="/register" className="text-indigo-600 font-bold hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500 animate-pulse">Loading login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

