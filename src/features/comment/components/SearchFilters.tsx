"use client";

import React, { useState } from "react";
import { Search, ChevronRight, MapPin, Thermometer, Calendar, Mail } from "lucide-react";
import { SearchFiltersType } from "../types";

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFiltersType) => void,
  initialFilters?: SearchFiltersType;
}

export function SearchFilters({ onFiltersChange, initialFilters }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempInputs, setTempInputs] = useState({
    location: initialFilters?.location || "",
    feelsLikeTemperature: "",
    month: initialFilters?.month || "",
    email: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setTempInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    const newFilters: SearchFiltersType = {};

    if (tempInputs.location.trim()) {
      newFilters.location = tempInputs.location.trim();
    }
    if (tempInputs.feelsLikeTemperature && !isNaN(Number(tempInputs.feelsLikeTemperature))) {
      newFilters.feelsLikeTemperature = Number(tempInputs.feelsLikeTemperature);
    }
    if (tempInputs.month && !isNaN(Number(tempInputs.month))) {
      const monthNum = Number(tempInputs.month);
      if (monthNum >= 1 && monthNum <= 12) {
        newFilters.month = monthNum;
      }
    }
    if (tempInputs.email.trim()) {
      newFilters.email = tempInputs.email.trim();
    }

    onFiltersChange(newFilters);
    setIsExpanded(false);
  };

  const handleReset = () => {
    setTempInputs({
      location: "",
      feelsLikeTemperature: "",
      month: "",
      email: ""
    });
    onFiltersChange({});
  };
  
  return (
    <div className="p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Search size={20} className="text-gray-400" />
          <span className="font-medium text-gray-700">검색 및 필터</span>
        </div>
        <ChevronRight 
          size={20} 
          className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
        />
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="pt-4 space-y-4 px-1">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={tempInputs.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="지역 검색"
                onKeyDown={(e) => e.key === 'Enter' && tempInputs.location && handleSearch()}
              />
            </div>
            <div className="relative">
              <Thermometer size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={tempInputs.feelsLikeTemperature}
                onChange={(e) => handleInputChange('feelsLikeTemperature', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="온도 (°C)"
                onKeyDown={(e) => e.key === 'Enter' && tempInputs.feelsLikeTemperature && handleSearch()}
              />
            </div>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                min="1"
                max="12"
                value={tempInputs.month}
                onChange={(e) => handleInputChange('month', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="월 (1-12)"
                onKeyDown={(e) => e.key === 'Enter' && tempInputs.month && handleSearch()}
              />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={tempInputs.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="이메일 주소"
                onKeyDown={(e) => e.key === 'Enter' && tempInputs.email && handleSearch()}
              />
            </div>
          </div>
                          
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-medium cursor-pointer"
            >
              검색하기
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-medium cursor-pointer"
            >
              초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}