"use client";

/**
 * 날씨 상태에 따른 캐릭터 이미지를 표시하는 컴포넌트
 *
 * @description
 * - 날씨 테마에 맞는 캐릭터 이미지를 표시
 * - 이미지가 없으면 아무것도 렌더링하지 않음
 * - 반응형 크기 조정 지원
 */
interface WeatherCharacterProps {
  src?: string; // 캐릭터 이미지 경로
  alt?: string; // 대체 텍스트
}

/**
 * 날씨 캐릭터 컴포넌트
 *
 * @param src - 캐릭터 이미지 경로 (선택사항)
 * @param alt - 대체 텍스트 (기본값: "weather character")
 * @returns 날씨 캐릭터 이미지 JSX 또는 null
 */
export default function WeatherCharacter({
  src,
  alt = "weather character",
}: WeatherCharacterProps) {
  // 이미지 경로가 없으면 아무것도 렌더링하지 않음
  if (!src) return null;

  return <img src={src} alt={alt} className="h-full object-contain" />;
}
