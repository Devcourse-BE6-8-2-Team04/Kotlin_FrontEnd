'use client';

import BackgroundLayout from '@/components/layout/BackgroundLayout';
import PlanForm from '@/app/plan/components/PlanForm';
import ResultsDisplay from '@/app/plan/components/ResultsDisplay';
import {usePlan} from '@/app/plan/hooks/usePlan';

export default function Plan() {
    const {
        destination,
        setDestination,
        checkInDate,
        setCheckInDate,
        checkOutDate,
        setCheckOutDate,
        clothData,
        weatherData,
        locationName,
        isLoading,
        error,
        handleConfirm,
    } = usePlan();

    return (
        <BackgroundLayout backgroundImage="/shine_background.png">
            <div className="relative z-10 h-full overflow-y-auto">
                <div className="w-[390px] mx-auto flex flex-col items-center p-4 pb-[80px]">
                    <PlanForm
                        destination={destination}
                        setDestination={setDestination}
                        checkInDate={checkInDate}
                        setCheckInDate={setCheckInDate}
                        checkOutDate={checkOutDate}
                        setCheckOutDate={setCheckOutDate}
                        handleConfirm={handleConfirm}
                        isLoading={isLoading}
                    />

                    <div
                        className="w-full mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg h-[30rem] flex items-center justify-center">
                        <ResultsDisplay
                            isLoading={isLoading}
                            error={error}
                            clothData={clothData}
                            weatherData={weatherData}
                            locationName={locationName}
                        />
                    </div>
                </div>
            </div>
        </BackgroundLayout>
    );
}