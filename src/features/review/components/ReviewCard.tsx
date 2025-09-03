"use client";

import type { components } from "@/lib/backend/apiV1/schema";
import { Shirt, Tag, ThumbsDown, ThumbsUp } from "lucide-react";
import { WeatherInfo } from "./WeatherInfo";

type ReviewDetailDto = components["schemas"]["ReviewDetailDto"];
type CategoryClothDto = components["schemas"]["CategoryClothDto"];

interface ReviewCardProps {
  review: ReviewDetailDto;
}

// 옷 이름 매핑
const CLOTH_NAME_MAP: Record<string, string> = {
  T_SHIRT: "반팔",
  SWEATSHIRT: "맨투맨",
  HOODIE: "후드티",
  SHIRT: "셔츠",
  DRESS_SHIRT: "드레스 셔츠",
  BLOUSE: "블라우스",
  SWEATER: "스웨터",
  CARDIGAN: "가디건",
  COAT: "코트",
  JACKET: "자켓",
  LEATHER_JACKET: "가죽 자켓",
  DENIM_JACKET: "데님 자켓",
  BLAZER: "블레이저",
  PADDING: "패딩",
  VEST: "조끼",
  WINDBREAKER: "바람막이",
  FUNCTIONAL_T_SHIRT: "기능성 티셔츠",
  JEANS: "청바지",
  SLACKS: "슬랙스",
  SHORTS: "반바지",
  SKIRT: "치마",
  JOGGER_PANTS: "조거 팬츠",
  TRACK_PANTS: "트랙 팬츠",
  LEGGINGS: "레깅스",
  CARGO_PANTS: "카고 바지",
  CORDUROY_PANTS: "골덴 바지",
  CHINOS: "치노스",
  SKI_PANTS: "스키 바지",
  SNEAKERS: "스니커즈",
  ATHLETIC_SHOES: "운동화",
  FLATS: "플랫슈즈",
  HEELS: "하이힐",
  LOAFERS: "로퍼",
  SLIPPERS: "슬리퍼",
  LEATHER_BOOTS: "가죽 부츠",
  FUR_BOOTS: "털 부츠",
  RAIN_BOOTS: "장화",
  SANDALS: "샌들",
  OXFORDS: "옥스포드",
  HIKING_SHOES: "하이킹 신발",
  ANKLE_BOOTS: "앵클 부츠",
  HAT: "모자",
  CAP: "캡",
  BEANIE: "비니",
  SCARF: "목도리",
  GLOVES: "장갑",
  BELT: "벨트",
  BAG: "가방",
  BACKPACK: "백팩",
  CROSSBODY_BAG: "크로스백",
  SUNGLASSES: "선글라스",
  UMBRELLA: "우산",
  MASK: "마스크",
};

// 스타일 매핑
const STYLE_MAP: Record<string, string> = {
  CASUAL_DAILY: "캐주얼 데일리",
  FORMAL_OFFICE: "포멀 오피스",
  OUTDOOR: "아웃도어",
  DATE_LOOK: "데이트 룩",
  EXTRA: "기타",
};

// 재질 매핑
const MATERIAL_MAP: Record<string, string> = {
  COTTON: "면",
  POLYESTER: "폴리에스터",
  WOOL: "울",
  LINEN: "린넨",
  NYLON: "나일론",
  DENIM: "데님",
  LEATHER: "가죽",
  FLEECE: "플리스",
  SILK: "실크",
  CASHMERE: "캐시미어",
  CORDUROY: "코듀로이",
};

// 카테고리별 이모지
const CATEGORY_EMOJI: Record<string, string> = {
  TOP: "👕",
  BOTTOM: "👖",
  SHOES: "👟",
  EXTRA: "🎒",
};

interface ClothItemProps {
  cloth: CategoryClothDto;
  isRecommended: boolean;
}

function ClothItem({ cloth, isRecommended }: ClothItemProps) {
  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
        isRecommended
          ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
      }`}
    >
      {/* 추천/비추천 아이콘 */}
      <div
        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
          isRecommended ? "bg-blue-500" : "bg-gray-500"
        }`}
      >
        {isRecommended ? (
          <ThumbsUp size={12} className="text-white" />
        ) : (
          <ThumbsDown size={12} className="text-white" />
        )}
      </div>

      {/* 옷 이미지 */}
      <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-white">
        <img
          src={cloth.imageUrl}
          alt={CLOTH_NAME_MAP[cloth.clothName] || cloth.clothName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* 옷 정보 */}
      <div className="space-y-2">
        {/* 카테고리와 옷 이름 */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{CATEGORY_EMOJI[cloth.category]}</span>
          <h4 className="font-semibold text-gray-900 text-sm">
            {CLOTH_NAME_MAP[cloth.clothName] || cloth.clothName}
          </h4>
        </div>

        {/* 스타일과 재질 */}
        <div className="space-y-1">
          {cloth.style && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">스타일:</span>
              <span className="text-xs font-medium text-gray-700">
                {STYLE_MAP[cloth.style] || cloth.style}
              </span>
            </div>
          )}
          {cloth.material && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">재질:</span>
              <span className="text-xs font-medium text-gray-700">
                {MATERIAL_MAP[cloth.material] || cloth.material}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReviewCard({ review }: ReviewCardProps) {
  const hasRecommendedClothes =
    review.recommendedClothList && review.recommendedClothList.length > 0;
  const hasNonRecommendedClothes =
    review.nonRecommendedClothList && review.nonRecommendedClothList.length > 0;
  const hasAnyClothes = hasRecommendedClothes || hasNonRecommendedClothes;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        {/* Title Section */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-keep leading-tight">
          {review.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-row items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="truncate">{review.email}</span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(review.weatherInfoDto.date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Weather Info */}
      <WeatherInfo weatherInfo={review.weatherInfoDto} />

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="whitespace-pre-line text-gray-700 leading-relaxed text-sm sm:text-base">
          {review.sentence}
        </div>
      </div>

      {/* Tags */}
      {review.tagString && (
        <div className="px-4 sm:px-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">태그</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {review.tagString
              .split("#")
              .filter((tag) => tag.trim() !== "")
              .map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200 font-medium"
                >
                  #{tag}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Clothing Section */}
      {hasAnyClothes && (
        <div className="px-4 sm:px-6 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <Shirt size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">
              착장 정보
            </span>
          </div>

          {/* 추천 옷들 */}
          {hasRecommendedClothes && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp size={14} className="text-blue-500" />
                <h3 className="text-sm font-medium text-blue-700">
                  추천 아이템
                </h3>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {review.recommendedClothList!.length}개
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {review.recommendedClothList!.map((cloth, index) => (
                  <ClothItem
                    key={`recommended-${index}`}
                    cloth={cloth}
                    isRecommended={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 비추천 옷들 */}
          {hasNonRecommendedClothes && (
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown size={14} className="text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">
                  일반 아이템
                </h3>
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {review.nonRecommendedClothList!.length}개
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {review.nonRecommendedClothList!.map((cloth, index) => (
                  <ClothItem
                    key={`non-recommended-${index}`}
                    cloth={cloth}
                    isRecommended={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image */}
      {review.imageUrl && (
        <div className="px-4 sm:px-6 pb-6">
          <div className="relative w-full overflow-hidden rounded-xl bg-gray-100">
            <img
              src={review.imageUrl}
              alt="댓글 이미지"
              className="w-full h-auto object-contain max-h-200"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}
