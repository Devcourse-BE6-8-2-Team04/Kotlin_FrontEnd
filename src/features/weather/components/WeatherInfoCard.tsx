"use client";

import { ReactNode } from "react";

/**
 * 날씨 정보를 카드 형태로 표시하는 재사용 가능한 컴포넌트
 *
 * @description
 * - 아이콘, 제목, 값, 설명을 포함한 통일된 카드 디자인
 * - 반투명 배경과 블러 효과로 모던한 UI
 * - 선택적 값과 설명 표시 지원
 */
interface WeatherInfoCardProps {
  icon: ReactNode; // 카드 상단에 표시할 아이콘
  title: string; // 카드 제목
  value?: ReactNode; // 주요 값 (선택사항)
  description?: ReactNode; // 추가 설명 (선택사항)
}

/**
 * 날씨 정보 카드 컴포넌트
 *
 * @param icon - 카드 상단에 표시할 아이콘
 * @param title - 카드 제목
 * @param value - 주요 값 (선택사항)
 * @param description - 추가 설명 (선택사항)
 * @returns 날씨 정보 카드 JSX
 */
export default function WeatherInfoCard({
  icon,
  title,
  value,
  description,
}: WeatherInfoCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white shadow-inner w-full">
      {/* 헤더: 아이콘과 제목 */}
      <div className="flex items-center gap-2 mb-2 text-white/90 text-sm font-semibold">
        {icon}
        {title}
      </div>

      {/* 주요 값 표시 (있는 경우에만) */}
      {value && (
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
      )}

      {/* 추가 설명 표시 (있는 경우에만) */}
      {description && <div className="text-sm text-white">{description}</div>}
    </div>
  );
}
