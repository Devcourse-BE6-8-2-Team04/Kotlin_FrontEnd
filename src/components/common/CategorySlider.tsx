"use client";
import React, { useMemo } from "react";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export type OutfitItem = {
  clothName: string;
  imageUrl: string;
  category: "TOP" | "BOTTOM" | "SHOES" | "EXTRA" | string;
  style?: string | null;       // "CASUAL_DAILY" | "FORMAL_OFFICE" | ...
  material?: string | null;
  maxFeelsLike?: number | null;
  minFeelsLike?: number | null;
};

export type CategorySlot = {
  top?: OutfitItem;
  bottom?: OutfitItem;
  shoes?: OutfitItem;
  extra?: OutfitItem;
};

interface CategorySliderProps {
  /** 백엔드 응답 그대로(category -> OutfitItem[]) */
  itemsMap: Record<string, OutfitItem[] | undefined>;
  /** 라벨 변환 (스타일/카테고리 키 ↔ 한글) */
  categoryNameMap?: Record<string, string>;
  /** 카드 상단의 섹션 제목 (ex. "추천", "비추천") */
  title?: string;
  /** 체감기온: 우선적으로 해당 온도 범위(min~max)에 들어오는 아이템을 선택 */
  feelsLike?: number;
  /** style이 null/없음(UNSPECIFIED)인 묶음 숨기기 */
  hideUnspecifiedStyles?: boolean;
  /** EXTRA가 없을 때 "없음" 문구를 숨기고 빈칸 유지 */
  hideExtraPlaceholder?: boolean;
}

function isTempMatch(item: OutfitItem, feelsLike?: number | null) {
  if (feelsLike == null) return true; // 온도 기준 없으면 모두 허용
  const min = item.minFeelsLike;
  const max = item.maxFeelsLike;
  if (min == null || max == null) return false; // 범위 정보 없는 건 2순위로
  return feelsLike >= min && feelsLike <= max;
}

export default function CategorySlider({
  itemsMap,
  categoryNameMap = {},
  title,
  feelsLike,
  hideUnspecifiedStyles = true,
  hideExtraPlaceholder = true,
}: CategorySliderProps) {
  /**
   * 1) 우선 온도 매칭되는 아이템들로 스타일 묶음(Top/Bottom/Shoes/Extra)을 구성
   * 2) 비어있는 자리는 온도 무시(fallback)로 보충
   * 3) 신발(shoes)이 비면 같은 스타일의 신발 → 아무 스타일의 신발 순으로 채움
   * 4) style === null → "UNSPECIFIED"로 묶이는데, hideUnspecifiedStyles면 제외
   */
  const styleMap = useMemo<Record<string, CategorySlot>>(() => {
    const map: Record<string, CategorySlot> = {};
    const put = (styleKey: string, category: string, item: OutfitItem) => {
      const slot = (map[styleKey] ||= {});
      if (category === "TOP" && !slot.top) slot.top = item;
      else if (category === "BOTTOM" && !slot.bottom) slot.bottom = item;
      else if (category === "SHOES" && !slot.shoes) slot.shoes = item;
      else if (category === "EXTRA" && !slot.extra) slot.extra = item;
    };

    const cats = ["TOP", "BOTTOM", "SHOES", "EXTRA"] as const;

    // 1차: 온도 매칭되는 아이템 먼저 배치
    cats.forEach((cat) => {
      (itemsMap[cat] ?? [])
        .filter((it) => isTempMatch(it, feelsLike))
        .forEach((item) => {
          const key = item.style || "UNSPECIFIED";
          put(key, cat, item);
        });
    });

    // 2차: 남은 자리는 온도 무시하고 보충
    cats.forEach((cat) => {
      (itemsMap[cat] ?? []).forEach((item) => {
        const key = item.style || "UNSPECIFIED";
        const slot = (map[key] ||= {});
        const has =
          (cat === "TOP" && slot.top) ||
          (cat === "BOTTOM" && slot.bottom) ||
          (cat === "SHOES" && slot.shoes) ||
          (cat === "EXTRA" && slot.extra);
        if (!has) put(key, cat, item);
      });
    });

    // 3차: 신발 보강 — 각 스타일 슬롯에서 shoes가 비어있으면 스타일 우선→글로벌 우선순위로 채우기
    const allShoesTemp = (itemsMap["SHOES"] ?? []).filter((it) => isTempMatch(it, feelsLike));
    const allShoesAny = itemsMap["SHOES"] ?? [];

    Object.entries(map).forEach(([styleKey, slot]) => {
      if (!slot.shoes) {
        // 같은 스타일의 신발 중 온도 매칭되는 것
        const sameStyleTemp = allShoesTemp.find((s) => (s.style || "UNSPECIFIED") === styleKey);
        // 같은 스타일의 신발(온도 무시)
        const sameStyleAny = allShoesAny.find((s) => (s.style || "UNSPECIFIED") === styleKey);
        // 아무 스타일 신발(온도 매칭)
        const anyTemp = allShoesTemp[0];
        // 아무 스타일 신발(온도 무시)
        const anyAny = allShoesAny[0];

        slot.shoes = sameStyleTemp || sameStyleAny || anyTemp || anyAny || undefined;
      }
    });

    // 4차: UNSPECIFIED 스타일 제거 옵션
    if (hideUnspecifiedStyles) {
      Object.keys(map).forEach((key) => {
        if (key === "UNSPECIFIED") delete map[key];
      });
    }

    return map;
  }, [itemsMap, feelsLike, hideUnspecifiedStyles]);

  const entries = Object.entries(styleMap);
  if (entries.length === 0) {
    return title ? (
      <div className="w-full max-w-[390px]">
        <div className="text-center text-white/90 font-semibold mb-2">{title}</div>
        <div className="w-[290px] mx-auto text-center text-sm text-white/90 opacity-80">
          표시할 아이템이 없어요.
        </div>
      </div>
    ) : null;
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 450,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    centerMode: false,
    centerPadding: "0px",
  };

  const renderCell = (
    item: OutfitItem | undefined,
    placeholder = "없음",
    options?: { isExtra?: boolean }
  ) => {
    // EXTRA 없으면 완전 빈칸 유지
    if (!item && options?.isExtra && hideExtraPlaceholder) {
      return <div className="w-[121px] h-[121px]" />;
    }
    if (!item) {
      return (
        <div className="w-[121px] h-[121px] bg-white/50 rounded-md flex items-center justify-center text-xs text-gray-500">
          {placeholder}
        </div>
      );
    }
    return (
      <img
        src={item.imageUrl}
        alt={item.clothName}
        className="w-[121px] h-[121px] object-cover rounded-md"
      />
    );
  };

  return (
    <>
      {title && (
        <div className="w-full text-center text-white/90 font-semibold mb-2">
          {title}
        </div>
      )}

      <Slider {...settings} className="category-slick-slider w-[350px] h-[375px]">
        {entries.map(([styleKey, slot]) => (
          <div key={styleKey} style={{ padding: "0 0px" }}>
            <div className="w-[290px] h-[375px] p-6 bg-[#ffffffcf] rounded-[15px] shadow-[3px_4px_10px_rgba(0,0,0,0.25)] mx-auto">
              <div className="text-center text-base font-semibold text-gray-700 pt-2">
                {categoryNameMap[styleKey] || styleKey}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {/* 1행: 상의 / 신발 */}
                {renderCell(slot.top)}
                {renderCell(slot.shoes)}

                {/* 2행: 하의 / 액세서리 */}
                {renderCell(slot.bottom)}
                {renderCell(slot.extra, "없음", { isExtra: true })}
              </div>

              <div className="mt-3 grid grid-cols-2 text-[11px] text-gray-600">
                <div className="text-center">상의</div>
                <div className="text-center">신발</div>
                <div className="text-center">하의</div>
                <div className="text-center">액세서리</div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      <style jsx global>{`
        .category-slick-slider.slick-slider { overflow: visible !important; }
        .category-slick-slider .slick-list { overflow: visible !important; }
      `}</style>
    </>
  );
}
