"use client";

import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-600">{message}</p>
      </div>
    </div>
  );
}
