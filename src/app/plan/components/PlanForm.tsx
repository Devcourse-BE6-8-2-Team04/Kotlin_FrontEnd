'use client';

import React from 'react';

interface PlanFormProps {
  destination: string;
  setDestination: (value: string) => void;
  checkInDate: string;
  setCheckInDate: (value: string) => void;
  checkOutDate: string;
  setCheckOutDate: (value: string) => void;
  handleConfirm: () => void;
  isLoading: boolean;
}

const PlanForm: React.FC<PlanFormProps> = ({
  destination,
  setDestination,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  handleConfirm,
  isLoading,
}) => {
  return (
    <div className="w-full mt-5 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col gap-3">
      <div className="flex flex-col">
        <label
          htmlFor="destination"
          className="text-sm font-semibold text-gray-700 mb-1"
        >
          여행지
        </label>
        <input
          type="text"
          id="destination"
          placeholder="어디로 떠나시나요?"
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
          value={destination}
          onChange={e => setDestination(e.target.value)}
        />
      </div>
      <div className="flex gap-3 w-full">
        <div className="flex flex-col w-1/2">
          <label
            htmlFor="checkInDate"
            className="text-sm font-semibold text-gray-700 mb-1"
          >
            체크인
          </label>
          <input
            type="date"
            id="checkInDate"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
            value={checkInDate}
            onChange={e => setCheckInDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-1/2">
          <label
            htmlFor="checkOutDate"
            className="text-sm font-semibold text-gray-700 mb-1"
          >
            체크아웃
          </label>
          <input
            type="date"
            id="checkOutDate"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
            value={checkOutDate}
            onChange={e => setCheckOutDate(e.target.value)}
          />
        </div>
      </div>
      <button
        className="w-full px-4 py-2 mt-2 bg-blue-600 text-white font-bold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={handleConfirm}
        disabled={isLoading}
      >
        {isLoading ? '로딩중...' : '확인'}
      </button>
    </div>
  );
};

export default PlanForm;
