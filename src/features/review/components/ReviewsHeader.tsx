"use client";

import { PencilLine } from "lucide-react";
import Link from "next/link";

export function ReviewsHeader() {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-40">
      <div className="p-4">
        <div className="flex relative items-center">
          <Link
            href="/reviews"
            className="absolute left-1/2 transform -translate-x-1/2 text-xl md:text-2xl font-bold text-black"
          >
            WearLog
          </Link>
          <div className="ml-auto">
            <Link href="/reviews/create">
              <button className="flex items-center gap-2 px-3.5 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all transform hover:scale-105 active:scale-95 shadow-sm cursor-pointer">
                <PencilLine size={18} />
                <span className="hidden sm:inline">글 쓰기</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
