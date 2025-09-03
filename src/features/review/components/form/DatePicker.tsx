"use client";

import { AlertCircle, Calendar } from "lucide-react";

interface DatePickerProps {
  date: string;
  error?: string;
  onChange: (value: string) => void;
}

export function DatePicker({ date, error, onChange }: DatePickerProps) {
  return (
    <div className="flex-1">
      <div className="flex flex-row rounded-lg border px-3 py-2 focus-within:border-blue-400 transition-all duration-150 border-gray-200">
        <Calendar size={18} className="text-black mr-2" />
        <input
          type="date"
          className="w-full text-sm focus:outline-none placeholder-gray-400"
          value={date}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-1 px-1">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
