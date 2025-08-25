"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4">
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all transform hover:scale-105 active:scale-95"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">이전</span>
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          {currentPage + 1}
        </span>
        <span className="text-sm text-gray-400">of</span>
        <span className="text-sm font-medium text-gray-700">
          {totalPages}
        </span>
      </div>

      <button
        disabled={currentPage + 1 >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all transform hover:scale-105 active:scale-95"
      >
        <span className="hidden sm:inline">다음</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}