"use client";

interface ResultsCountProps {
  totalElements: number;
  hasActiveFilters: boolean;
}

export function ResultsCount({
  totalElements,
  hasActiveFilters,
}: ResultsCountProps) {
  if (!hasActiveFilters) return null;

  return (
    <div className="text-sm text-gray-600 mb-4 px-2">
      검색 결과: 총{" "}
      <span className="font-semibold text-black">{totalElements}</span>건
    </div>
  );
}
