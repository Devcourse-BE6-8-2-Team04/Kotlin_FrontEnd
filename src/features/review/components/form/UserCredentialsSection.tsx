"use client";

import { AlertCircle, Lock, Mail } from "lucide-react";
import { forwardRef } from "react";

interface UserCredentialsSectionProps {
  isLoggedIn: boolean;
  email: string;
  password: string;
  errors: { email?: string; password?: string };
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export const UserCredentialsSection = forwardRef<
  HTMLInputElement,
  UserCredentialsSectionProps
>(
  (
    { isLoggedIn, email, password, errors, onEmailChange, onPasswordChange },
    ref
  ) => {
    if (isLoggedIn) return null;

    return (
      <>
        {/* 이메일 */}
        <div className="flex-1">
          <div className="flex items-center rounded-lg border px-3 py-2 focus-within:border-blue-400 transition-all duration-150 border-gray-200">
            <Mail size={18} className="mr-2 text-black" />
            <input
              ref={ref}
              type="email"
              placeholder="이메일"
              className="w-full text-sm focus:outline-none placeholder-gray-400"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              style={{ color: "#222" }}
            />
          </div>
          {errors.email && (
            <div className="flex items-center gap-2 mt-1 px-1">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{errors.email}</p>
            </div>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="flex-1">
          <div className="flex items-center rounded-lg border px-3 py-2 focus-within:border-blue-400 transition-all duration-150 border-gray-200">
            <Lock size={18} className="mr-2 text-black" />
            <input
              type="password"
              placeholder="비밀번호"
              className="w-full text-sm focus:outline-none placeholder-gray-400"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              autoComplete="new-password"
              style={{ color: "#222" }}
            />
          </div>
          {errors.password && (
            <div className="flex items-center gap-2 mt-1 px-1">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{errors.password}</p>
            </div>
          )}
        </div>
      </>
    );
  }
);

UserCredentialsSection.displayName = "UserCredentialsSection";
