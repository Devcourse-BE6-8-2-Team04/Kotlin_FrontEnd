"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Navigation } from "lucide-react";
import WeeklyForecastSwiper from "@/features/weather/components/WeeklyForecastSwiper";
import {
  getGeoLocations,
  getWeeklyWeather,
  type GeoLocationDto,
  type WeatherInfoDto,
} from "@/lib/backend/apiV1/weatherService";

/**
 * 당겨서 검색창을 열 수 있는 인터랙티브 검색 컴포넌트
 *
 * @description
 * - 화면을 아래로 당기면 검색창이 나타남
 * - 최근 검색어 저장 및 표시
 * - 현재 위치 기반 날씨 정보 가져오기
 * - 검색 결과 선택 시 날씨 정보 업데이트
 * - 터치 제스처 기반 인터랙션
 * - 실제 API를 통한 지역 검색 및 날씨 데이터 조회
 */
export default function PullToRevealSearch() {
  // 터치 제스처 관련 상태
  const [offset, setOffset] = useState(0); // 당김 거리
  const [isSearchVisible, setIsSearchVisible] = useState(false); // 검색창 표시 여부
  const [canPull, setCanPull] = useState(true); // 당김 가능 여부

  // 터치 이벤트 참조
  const startYRef = useRef<number | null>(null); // 터치 시작 Y 좌표
  const contentRef = useRef<HTMLDivElement>(null); // 콘텐츠 영역 참조

  // 검색 관련 상태
  const [query, setQuery] = useState(""); // 검색어
  const [showOverlay, setShowOverlay] = useState(false); // 오버레이 표시 여부
  const [recentSearches, setRecentSearches] = useState<string[]>([]); // 최근 검색어 목록
  const [searchResults, setSearchResults] = useState<GeoLocationDto[]>([]); // 검색 결과
  const [isSearching, setIsSearching] = useState(false); // 검색 중 여부
  const [searchLoading, setSearchLoading] = useState(false); // 검색 로딩 상태

  // 현재 위치 상태
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  // 컴포넌트 마운트 시 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  /**
   * 최근 검색어를 로컬 스토리지에 저장하는 함수
   *
   * @param list - 저장할 검색어 목록
   */
  const saveToLocal = (list: string[]) => {
    localStorage.setItem("recentSearches", JSON.stringify(list));
  };

  /**
   * 스크롤 이벤트 핸들러
   * 스크롤 가능한 경우에만 최상단에서 pull 허용
   */
  const handleScroll = () => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const scrollTop = el.scrollTop;
    const hasScroll = el.scrollHeight > el.clientHeight;

    // 스크롤 가능한 경우에만 최상단에서 pull 허용
    setCanPull(!hasScroll || scrollTop <= 0);
  };

  /**
   * 터치 시작 이벤트 핸들러
   *
   * @param e - 터치 이벤트 객체
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = contentRef.current?.scrollTop ?? 0;
    const hasScroll =
      contentRef.current &&
      contentRef.current.scrollHeight > contentRef.current.clientHeight;

    // 스크롤 중이거나 당김 불가능한 경우 터치 무시
    if ((hasScroll && scrollTop > 0) || !canPull) return;

    startYRef.current = e.touches[0].clientY;
  };

  /**
   * 터치 이동 이벤트 핸들러
   *
   * @param e - 터치 이벤트 객체
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null) return;

    const currentY = e.touches[0].clientY;
    const startY = startYRef.current;
    const diff = currentY - startY;

    // 아래로 당기는 경우 (최대 150px)
    if (diff > 0 && diff < 150) {
      setOffset(diff);
    } else if (diff < 0 && offset > 0) {
      // 위로 올리는 경우 (당김 거리 감소)
      setOffset((prev) => Math.max(0, prev + diff));
    }
  };

  /**
   * 터치 종료 이벤트 핸들러
   * 50px 이상 당겼으면 검색창 표시, 아니면 원래 위치로
   */
  const handleTouchEnd = () => {
    if (offset >= 50) {
      setOffset(80);
      setIsSearchVisible(true);
    } else {
      setOffset(0);
      setIsSearchVisible(false);
    }
    startYRef.current = null;
  };

  /**
   * 검색창 더블클릭 핸들러
   */
  const handleDoubleClick = () => {
    if (showOverlay) {
      closeOverlay();
    } else {
      setOffset(80);
      setIsSearchVisible(true);
    }
  };

  /**
   * 검색 실행 함수
   * 실제 API를 통해 지역 정보를 검색
   *
   * @param searchQuery - 검색할 쿼리 (기본값: 현재 query 상태)
   */
  const handleSearch = async (searchQuery?: string) => {
    const queryToUse = searchQuery || query;
    const trimmed = queryToUse.trim();
    if (!trimmed) return;

    try {
      setSearchLoading(true);
      setIsSearching(true);

      // API를 통해 지역 정보 검색
      const results = await getGeoLocations(trimmed);
      setSearchResults(results);

      // 최근 검색어 업데이트 (중복 제거, 최대 5개)
      const updated = [
        trimmed,
        ...recentSearches.filter((item) => item !== trimmed),
      ].slice(0, 5);
      setRecentSearches(updated);
      saveToLocal(updated);
    } catch (error) {
      console.error("검색 실패:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  /**
   * 검색 결과 선택 시 실행되는 함수
   * 선택된 지역의 좌표 정보로 날씨 정보 요청
   *
   * @param location - 선택된 지역 정보
   */
  const handleSelectResult = async (location: GeoLocationDto) => {
    try {
      // 선택된 지역의 날씨 정보 조회
      const weatherData = await getWeeklyWeather(location.lat, location.lon);

      // 날씨 정보 업데이트 이벤트 발생
      window.dispatchEvent(
        new CustomEvent("weather:update", {
          detail: {
            weatherData,
            source: "search",
          },
        })
      );

      // 검색 상태 초기화
      setShowOverlay(false);
      setOffset(0);
      setQuery("");
      setSearchResults([]);
      setIsSearching(false);
    } catch (error) {
      console.error("날씨 정보 조회 실패:", error);
      alert("날씨 정보를 가져올 수 없습니다.");
    }
  };

  /**
   * 현재 위치 기반 날씨 정보 가져오기
   * 이미 현재 위치인 경우는 요청하지 않음
   */
  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("위치 정보를 지원하지 않는 브라우저입니다.");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      const { latitude, longitude } = position.coords;
      const newLocation = { lat: latitude, lon: longitude };

      // 이미 현재 위치인 경우 요청하지 않음
      const currentSource = (window as any).__currentWeatherSource;
      if (currentSource === "current") {
        closeOverlay();
        return;
      }

      setCurrentLocation(newLocation);

      // 현재 위치의 날씨 정보 조회
      const weatherData = await getWeeklyWeather(latitude, longitude);

      // 날씨 정보 업데이트 이벤트 발생
      window.dispatchEvent(
        new CustomEvent("weather:update", {
          detail: {
            weatherData,
            source: "current",
          },
        })
      );

      closeOverlay();
    } catch (error) {
      console.error("위치 정보 조회 실패:", error);
      alert("위치 정보를 가져올 수 없습니다.");
    }
  };

  /**
   * 키보드 이벤트 핸들러 (Enter 키로 검색 실행)
   *
   * @param e - 키보드 이벤트 객체
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  /**
   * 최근 검색어에서 항목 제거
   *
   * @param item - 제거할 검색어
   */
  const removeRecent = (item: string) => {
    const updated = recentSearches.filter((v) => v !== item);
    setRecentSearches(updated);
    saveToLocal(updated);
  };

  /**
   * 검색 오버레이 닫기
   */
  const closeOverlay = () => {
    setOffset(0);
    setShowOverlay(false);
    setQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 검색 오버레이 (전체 화면) */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black text-white z-50 overflow-y-auto">
          {/* 검색 헤더 */}
          <div className="h-[80px] bg-gray-800 flex items-center justify-center px-4 shadow-md">
            <div className="flex items-center gap-2 w-full max-w-md bg-gray-900 rounded px-3 py-1.5">
              <input
                type="text"
                placeholder="도시명을 입력하세요"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 p-1 bg-transparent text-white placeholder-gray-300 focus:outline-none text-base"
                autoFocus
              />
              <button
                onClick={() => handleSearch()}
                disabled={searchLoading}
                className="text-gray-300 hover:text-white disabled:opacity-50"
              >
                <Search size={20} />
              </button>
              <button
                onClick={closeOverlay}
                className="text-gray-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* 검색 콘텐츠 */}
          <div className="px-4 py-6">
            <div className="max-w-md mx-auto space-y-6">
              {!isSearching && (
                <>
                  {/* 현재 위치 버튼 */}
                  <div
                    className="flex items-center gap-2 text-white cursor-pointer"
                    onClick={handleCurrentLocation}
                  >
                    <Navigation size={20} />
                    <span className="text-base">현재위치</span>
                  </div>

                  {/* 최근 검색어 목록 */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">
                        최근 검색어
                      </div>
                      <ul className="space-y-2">
                        {recentSearches.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-gray-300"
                          >
                            <button
                              onClick={() => {
                                setQuery(item);
                                handleSearch(item);
                              }}
                              className="hover:text-white text-base"
                            >
                              {item}
                            </button>
                            <button
                              onClick={() => removeRecent(item)}
                              className="text-gray-400 hover:text-white"
                            >
                              <X size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {/* 검색 로딩 상태 */}
              {searchLoading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm text-gray-400">검색 중...</p>
                </div>
              )}

              {/* 검색 결과 목록 */}
              {searchResults.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-2">검색 결과</div>
                  <ul className="space-y-2">
                    {searchResults.map((location) => (
                      <li
                        key={`${location.lat}-${location.lon}`}
                        className="cursor-pointer hover:text-white text-gray-300 text-base p-2 rounded hover:bg-white/10"
                        onClick={() => handleSelectResult(location)}
                      >
                        {location.localName
                          ? `${location.localName} (${location.name}, ${location.country})`
                          : `${location.name}, ${location.country}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 검색 결과가 없는 경우 */}
              {isSearching && !searchLoading && searchResults.length === 0 && (
                <div className="text-center text-gray-400">
                  <p>검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 검색창 당기기 UI */}
      <div
        className="absolute top-[-80px] left-0 w-full transition-transform duration-200"
        style={{ transform: `translateY(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        {/* 검색 헤더 (고정 위치) */}
        <div className="h-[80px] bg-gray-800 text-white flex items-center justify-center px-4">
          <div className="flex items-center gap-2 w-full max-w-md bg-gray-900 rounded px-3 py-1.5">
            <input
              type="text"
              placeholder="도시명을 입력하세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowOverlay(true)}
              className="flex-1 p-1 bg-transparent text-white placeholder-gray-300 focus:outline-none text-base"
            />
            <button
              onClick={() => handleSearch()}
              disabled={searchLoading}
              className="text-gray-300 hover:text-white disabled:opacity-50"
            >
              <Search size={20} />
            </button>
            <button
              onClick={closeOverlay}
              className="text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 날씨 콘텐츠 영역 */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className={`transition-all duration-300 ${
            isSearchVisible
              ? "h-screen overflow-hidden"
              : "h-auto max-h-screen overflow-y-auto"
          }`}
        >
          <WeeklyForecastSwiper />
        </div>
      </div>
    </div>
  );
}
