"use client";

import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-white flex justify-center items-center">
      <div className="text-center">
        <Loader2
          size={32}
          className="animate-spin text-gray-600 mx-auto mb-4"
        />
        <p className="text-gray-600 font-medium">로딩 중...</p>
      </div>
    </div>
  );
}
