'use client';

import React, { createRef, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Cloth, ClothApiResponse } from '@/app/plan/types';

interface ClothResultsProps {
  clothData: ClothApiResponse | null;
}

interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

type DisplayMode = 'unique' | 'aggregated';

const ClothResults: React.FC<ClothResultsProps> = ({ clothData }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('unique');
  const scrollRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const [scrollStates, setScrollStates] = useState<{ [key: string]: ScrollState }>({});

  type Processed =
    | {
        clothes: { [category: string]: (Cloth & { count?: number })[] };
        extraClothes: { EXTRA: (Cloth & { count?: number })[] };
      }
    | null;

  const [processedClothData, setProcessedClothData] = useState<Processed>(null);

  const checkScrollability = (key: string) => {
    const ref = scrollRefs.current[key];
    if (ref?.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft < scrollWidth - clientWidth;
      setScrollStates(prev => ({ ...prev, [key]: { canScrollLeft, canScrollRight } }));
    }
  };

  // ✅ 안전한 가드용 헬퍼
  const safeClothesMap = clothData?.clothes ?? {};
  const safeExtraList = clothData?.extraClothes?.EXTRA ?? [];

  useEffect(() => {
    // clothData가 없으면 초기화하고 종료
    if (!clothData) {
      scrollRefs.current = {};
      setScrollStates({});
      setProcessedClothData(null);
      return;
    }

    // 카테고리/엑스트라 기본값 보장
    const categories = Object.keys(safeClothesMap); // safeClothesMap은 항상 {}
    const hasExtra = Array.isArray(safeExtraList) && safeExtraList.length > 0;

    // 스크롤 ref/state 재생성
    const newRefs: { [key: string]: React.RefObject<HTMLDivElement> } = {};
    const newScrollStates: { [key: string]: ScrollState } = {};
    categories.forEach(category => {
      newRefs[category] = createRef<HTMLDivElement>();
      newScrollStates[category] = { canScrollLeft: false, canScrollRight: true };
    });
    if (hasExtra) {
      newRefs['extra'] = createRef<HTMLDivElement>();
      newScrollStates['extra'] = { canScrollLeft: false, canScrollRight: true };
    }
    scrollRefs.current = newRefs;
    setScrollStates(newScrollStates);

    // 데이터 가공
    if (displayMode === 'unique') {
      const uniqueClothes: { [category: string]: Cloth[] } = {};
      Object.entries(safeClothesMap).forEach(([category, clothes = []]) => {
        const seenIds = new Set<number>();
        uniqueClothes[category] = (clothes ?? []).filter(cloth => {
          if (seenIds.has(cloth.id)) return false;
          seenIds.add(cloth.id);
          return true;
        });
      });

      setProcessedClothData({
        clothes: uniqueClothes,
        extraClothes: { EXTRA: safeExtraList },
      });
    } else {
      // aggregated
      const aggregatedClothes: { [category: string]: (Cloth & { count: number })[] } = {};
      Object.entries(safeClothesMap).forEach(([category, clothes = []]) => {
        const counts: { [id: number]: (Cloth & { count: number }) } = {};
        (clothes ?? []).forEach(cloth => {
          if (counts[cloth.id]) {
            counts[cloth.id].count += 1;
          } else {
            counts[cloth.id] = { ...cloth, count: 1 };
          }
        });
        aggregatedClothes[category] = Object.values(counts);
      });

      setProcessedClothData({
        clothes: aggregatedClothes,
        extraClothes: { EXTRA: safeExtraList }, // extra는 집계하지 않음
      });
    }
  }, [clothData, displayMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ 결과가 완전히 없을 때 깔끔히 종료
  if (!processedClothData) return null;

  const renderedCategories = Object.entries(processedClothData.clothes ?? {});
  const renderedExtra = processedClothData.extraClothes?.EXTRA ?? [];

  // 아무 아이템도 없으면 빈 상태 표시(선택)
  if (renderedCategories.length === 0 && renderedExtra.length === 0) {
    return (
      <div className="w-full text-center text-gray-500 py-8">
        추천 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4 gap-2">
        <button
          className={`px-3 py-1 rounded-md text-sm font-semibold ${
            displayMode === 'unique' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setDisplayMode('unique')}
        >
          종류만 보기
        </button>
        <button
          className={`px-3 py-1 rounded-md text-sm font-semibold ${
            displayMode === 'aggregated' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setDisplayMode('aggregated')}
        >
          종합해서 보기
        </button>
      </div>

      {renderedCategories.map(([category, clothes]) => (
        <div key={category} className="mb-8 relative">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            {category}
          </h2>
          <div
            ref={scrollRefs.current[category]}
            onScroll={() => checkScrollability(category)}
            className="flex overflow-x-auto space-x-4 p-2 scroll-smooth scrollbar-hide"
          >
            {(clothes ?? []).map((cloth: Cloth & { count?: number }) => (
              <div
                key={cloth.id}
                className="flex-shrink-0 w-36 border rounded-lg shadow-md overflow-hidden bg-white/80"
              >
                <div className="relative w-full h-32">
                  <Image
                    src={cloth.imageUrl}
                    alt={cloth.clothName}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="144px"
                  />
                </div>
                <div className="p-2 text-center">
                  <p className="font-semibold text-sm text-gray-700">
                    {cloth.clothName}
                    {cloth.count && cloth.count > 1 && ` (${cloth.count}개)`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {renderedExtra.length > 0 && (
        <div className="mb-8 relative">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            챙겨가면 좋은 것들
          </h2>
          <div
            ref={scrollRefs.current['extra']}
            onScroll={() => checkScrollability('extra')}
            className="flex overflow-x-auto space-x-4 p-2 scroll-smooth scrollbar-hide"
          >
            {renderedExtra.map(item => (
              <div
                key={`extra-${item.id}`}
                className="flex-shrink-0 w-36 border rounded-lg shadow-md overflow-hidden bg-white/80"
              >
                <div className="relative w-full h-32">
                  <Image
                    src={item.imageUrl}
                    alt={item.clothName}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="144px"
                  />
                </div>
                <div className="p-2 text-center">
                  <p className="font-semibold text-sm text-gray-700">
                    {item.clothName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClothResults;
