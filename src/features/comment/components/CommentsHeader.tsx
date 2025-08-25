"use client";

import React from "react";
import Link from "next/link";
import { PencilLine } from "lucide-react";

interface HeaderProps {
  onCreateClick: () => void;
}

export function Header({ onCreateClick }: HeaderProps) {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="p-4">
          <div className="flex relative items-center">
            <Link href="/comments" className="absolute left-1/2 transform -translate-x-1/2 text-xl md:text-2xl font-bold text-blue-900">
              WearLog
            </Link>
            <div className="ml-auto">
              <Link href="/comments/create">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
                >
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