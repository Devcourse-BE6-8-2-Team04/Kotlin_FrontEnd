"use client";

import { ChevronLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ReviewHeaderProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function ReviewHeader({ onEdit, onDelete }: ReviewHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white shadow-sm sticky top-0 z-40">
      <div className="p-4 flex items-center relative">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <Link
          href="/reviews"
          className="absolute left-1/2 transform -translate-x-1/2 text-xl md:text-2xl font-bold text-black"
        >
          WearLog
        </Link>

        <div className="ml-auto flex">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-2 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <Edit size={18} />
            <span className="hidden sm:inline text-sm font-medium">수정</span>
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-2 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline text-sm font-medium">삭제</span>
          </button>
        </div>
      </div>
    </div>
  );
}
