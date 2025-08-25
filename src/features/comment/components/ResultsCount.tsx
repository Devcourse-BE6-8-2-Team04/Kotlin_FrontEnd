"use client";

import React from "react";

interface ResultsCountProps {
  totalElements: number;
  hasActiveFilters: boolean;
}

export function ResultsCount({ totalElements, hasActiveFilters }: ResultsCountProps) {
  if (!hasActiveFilters) return null;

  return (
    <div className="text-sm text-gray-600 mb-4 px-1">
      검색 결과: 총 <span className="font-semibold text-blue-600">{totalElements}</span>건
    </div>
  );
}