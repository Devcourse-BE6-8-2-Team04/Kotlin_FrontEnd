"use client";

import { forwardRef } from "react";

interface TitleInputProps {
  title: string;
  error?: string;
  onChange: (value: string) => void;
}

export const TitleInput = forwardRef<HTMLInputElement, TitleInputProps>(
  ({ title, error, onChange }, ref) => {
    return (
      <div className="mt-4">
        <input
          ref={ref}
          type="text"
          placeholder="제목을 입력해주세요."
          className="w-full px-2 pt-4 pb-2 bg-white border-0 text-base font-medium placeholder-gray-400 resize-none focus:outline-none"
          value={title}
          onChange={(e) => onChange(e.target.value)}
          maxLength={100}
          required
        />
        {error && <p className="text-sm text-red-500 mt-1 px-2">{error}</p>}
        <div className="relative px-1">
          <hr className="border-gray-200" />
        </div>
      </div>
    );
  }
);

TitleInput.displayName = "TitleInput";
