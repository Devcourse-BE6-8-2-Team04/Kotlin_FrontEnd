"use client";

import { GeoLocationDto } from "@/lib/backend/apiV1/weatherService";
import { Loader2, MapPin, X } from "lucide-react";
import { forwardRef } from "react";

interface LocationSearchProps {
  location: string;
  selectedCity: GeoLocationDto | null;
  locationCandidates: GeoLocationDto[];
  showDropdown: boolean;
  isLoadingCities: boolean;
  onLocationChange: (value: string) => void;
  onCitySelect: (city: GeoLocationDto) => void;
  onClearCity: () => void;
  onFocus: () => void;
}

export const LocationSearch = forwardRef<HTMLDivElement, LocationSearchProps>(
  (
    {
      location,
      selectedCity,
      locationCandidates,
      showDropdown,
      isLoadingCities,
      onLocationChange,
      onCitySelect,
      onClearCity,
      onFocus,
    },
    ref
  ) => {
    return (
      <div className="relative flex-1" ref={ref}>
        {/* 선택된 도시가 있을 때의 표시 */}
        {selectedCity ? (
          <div className="flex items-center justify-between rounded-lg border px-3 py-3 transition-all duration-150 border-gray-200">
            <div className="flex items-center">
              <MapPin size={18} className="text-black mr-2" />
              <span className="text-sm font-medium">
                {selectedCity.localName
                  ? `${selectedCity.localName} (${selectedCity.name}, ${selectedCity.country})`
                  : `${selectedCity.name}, ${selectedCity.country}`}
              </span>
            </div>
            <button
              type="button"
              onClick={onClearCity}
              className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={16} className="text-black" />
            </button>
          </div>
        ) : (
          /* 검색 입력 필드 */
          <div className="flex items-center rounded-lg border px-3 py-2 focus-within:border-blue-400 transition-all duration-150 border-gray-200">
            <MapPin size={18} className="text-black mr-2" />
            <input
              type="text"
              placeholder="도시 검색"
              className="w-full text-sm focus:outline-none placeholder-gray-400"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              onFocus={onFocus}
              autoComplete="off"
              required
              style={{ color: "#222" }}
            />
            {isLoadingCities && (
              <Loader2 className="animate-spin ml-2 text-blue-500" size={18} />
            )}
          </div>
        )}

        {/* 검색 결과 드롭다운 */}
        {showDropdown && !selectedCity && (
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-auto animate-in fade-in duration-150">
            {locationCandidates.length === 0 ? (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">
                검색 결과가 없습니다
              </div>
            ) : (
              locationCandidates.map((city, idx) => (
                <div
                  key={`${city.lat}-${city.lon}-${idx}`}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-900 transition-colors border-b border-gray-50 last:border-b-0"
                  onClick={() => onCitySelect(city)}
                >
                  <div className="font-medium">
                    {city.localName || city.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {city.country}
                    {city.localName && ` • ${city.name}`}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
);

LocationSearch.displayName = "LocationSearch";
