"use client";

import type { components } from "@/lib/backend/apiV1/schema";
import { apiFetch } from "@/lib/backend/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchFiltersType } from "../types";
import { ActiveFilters } from "./ActiveFilters";
import { LoadingSpinner } from "./LoadingSpinner";
import { Pagination } from "./Pagination";
import { ResultsCount } from "./ResultsCount";
import { ReviewsHeader } from "./ReviewsHeader";
import { ReviewsList } from "./ReviewsList";
import { SearchFilters } from "./SearchFilters";

type ReviewDto = components["schemas"]["ReviewDto"];

export default function ReviewsMain() {
  const searchParams = useSearchParams();

  const [reviews, setReviews] = useState<ReviewDto[] | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState<SearchFiltersType>(() => {
    const initialLocation = searchParams.get("location");
    const initialDate = searchParams.get("date"); // 'date' 파라미터도 있다면
    const initialMonth = initialDate
      ? new Date(initialDate).getMonth() + 1
      : undefined; // 날짜에서 월 추출
    // const initialFeelsLikeTemperature = searchParams.get('feelsLikeTemperature');

    const initialFilters: SearchFiltersType = {};
    if (initialLocation) {
      initialFilters.location = initialLocation;
    }
    if (initialMonth !== undefined) {
      initialFilters.month = initialMonth;
    }
    // if (initialFeelsLikeTemperature) {
    //   initialFilters.feelsLikeTemperature = parseFloat(initialFeelsLikeTemperature);
    // }
    return initialFilters;
  });

  const fetchReviews = async (
    currentPage: number,
    searchFilters: SearchFiltersType
  ) => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      size: "10",
    });

    if (searchFilters.location)
      params.append("location", searchFilters.location);
    if (searchFilters.feelsLikeTemperature !== undefined)
      params.append(
        "feelsLikeTemperature",
        searchFilters.feelsLikeTemperature.toString()
      );
    if (searchFilters.month !== undefined)
      params.append("month", searchFilters.month.toString());
    if (searchFilters.email) params.append("email", searchFilters.email);

    apiFetch(`/api/v1/reviews?${params}`)
      .then((res) => {
        setReviews(res.content || []);
        setTotalPages(res.totalPages ?? 0);
        setTotalElements(res.totalElements);
      })
      .catch((error) => {
        console.error(`${error.resultCode} : ${error.msg}`);
      });
  };

  useEffect(() => {
    fetchReviews(page, filters);
  }, [page, filters]);

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setPage(0); // 필터 변경 시 첫 페이지로 이동
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  if (reviews === null) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white pb-[73px]">
      <ReviewsHeader />

      <div className="px-3 py-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <SearchFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
          <ActiveFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        <ResultsCount
          totalElements={totalElements}
          hasActiveFilters={hasActiveFilters}
        />

        <ReviewsList
          reviews={reviews}
          totalElements={totalElements}
          page={page}
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
