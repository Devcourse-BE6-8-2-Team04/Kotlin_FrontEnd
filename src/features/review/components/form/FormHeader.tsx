"use client";

import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormHeaderProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function FormHeader({ isSubmitting, onSubmit }: FormHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
      <div className="relative flex items-center px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-1"
          disabled={isSubmitting}
        >
          <X size={24} className="text-gray-600" />
        </button>

        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-medium text-gray-900">
          글쓰기
        </h1>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="ml-auto px-4 py-1.5 bg-black text-white text-sm font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-1">
              <Loader2 size={14} className="animate-spin" />
              등록중
            </div>
          ) : (
            "등록"
          )}
        </button>
      </div>
    </div>
  );
}
