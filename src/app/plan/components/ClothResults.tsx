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
        recommended: { [category: string]: (Cloth & { count?: number })[] };
        notRecommended: { [category: string]: (Cloth & { count?: number })[] };
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

  const safeRecommendedMap = clothData?.recommendedOutfits ?? {};
  const safeNotRecommendedMap = clothData?.notRecommendedOutfits ?? {};

  useEffect(() => {
    if (!clothData) {
      scrollRefs.current = {};
      setScrollStates({});
      setProcessedClothData(null);
      return;
    }

    const recommendedCategories = Object.keys(safeRecommendedMap);
    const notRecommendedCategories = Object.keys(safeNotRecommendedMap);

    const newRefs: { [key: string]: React.RefObject<HTMLDivElement> } = {};
    const newScrollStates: { [key: string]: ScrollState } = {};

    recommendedCategories.forEach(category => {
      const key = `rec-${category}`;
      newRefs[key] = createRef<HTMLDivElement>();
      newScrollStates[key] = { canScrollLeft: false, canScrollRight: true };
    });
    notRecommendedCategories.forEach(category => {
      const key = `not-rec-${category}`;
      newRefs[key] = createRef<HTMLDivElement>();
      newScrollStates[key] = { canScrollLeft: false, canScrollRight: true };
    });

    scrollRefs.current = newRefs;
    setScrollStates(newScrollStates);

    const processOutfits = (outfits: { [category: string]: Cloth[] }) => {
      if (displayMode === 'unique') {
        const uniqueClothes: { [category: string]: Cloth[] } = {};
        Object.entries(outfits).forEach(([category, clothes = []]) => {
          const seenIds = new Set<number>();
          uniqueClothes[category] = (clothes ?? []).filter(cloth => {
            if (seenIds.has(cloth.id)) return false;
            seenIds.add(cloth.id);
            return true;
          });
        });
        return uniqueClothes;
      } else {
        const aggregatedClothes: { [category: string]: (Cloth & { count: number })[] } = {};
        Object.entries(outfits).forEach(([category, clothes = []]) => {
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
        return aggregatedClothes;
      }
    };

    setProcessedClothData({
      recommended: processOutfits(safeRecommendedMap),
      notRecommended: processOutfits(safeNotRecommendedMap),
    });
  }, [clothData, displayMode, safeRecommendedMap, safeNotRecommendedMap]);

  if (!processedClothData) return null;

  const renderedRecommended = Object.entries(processedClothData.recommended ?? {});
  const renderedNotRecommended = Object.entries(processedClothData.notRecommended ?? {});

  if (renderedRecommended.length === 0 && renderedNotRecommended.length === 0) {
    return (
      <div className="w-full text-center text-gray-500 py-8">
        추천 결과가 없습니다.
      </div>
    );
  }

  const renderOutfitSection = (
    title: string,
    outfits: [string, (Cloth & { count?: number })[]][],
    refKeyPrefix: string
  ) => {
    if (outfits.length === 0) return null;
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-300 pb-3">{title}</h2>
        {outfits.map(([category, clothes]) => (
          <div key={category} className="mb-8 relative">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2">
              {category}
            </h3>
            <div
              ref={scrollRefs.current[`${refKeyPrefix}-${category}`]}
              onScroll={() => checkScrollability(`${refKeyPrefix}-${category}`)}
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
      </div>
    );
  };

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

      {renderOutfitSection('추천 의류', renderedRecommended, 'rec')}
      {renderOutfitSection('비추천 의류', renderedNotRecommended, 'not-rec')}
    </div>
  );
};

export default ClothResults;
