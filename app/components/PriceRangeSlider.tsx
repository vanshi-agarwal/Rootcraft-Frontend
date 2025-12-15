"use client";

import React, { useState, useEffect, useRef } from "react";

interface PriceRangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}

const PriceRangeSlider = ({ min, max, value, onChange }: PriceRangeSliderProps) => {
    const [minVal, setMinVal] = useState(value[0]);
    const [maxVal, setMaxVal] = useState(value[1]);
    const range = useRef<HTMLDivElement>(null);

    // Convert to percentage
    const getPercent = (val: number) =>
        Math.round(((val - min) / (max - min)) * 100);

    useEffect(() => {
        setMinVal(value[0]);
        setMaxVal(value[1]);
    }, [value]);

    useEffect(() => {
        if (range.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(maxVal);

            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, maxVal, min, max]);

    return (
        <div className="pt-2 pb-6 w-full">
            <div className="relative h-1 w-full bg-gray-200 rounded-lg">
                {/* Track highlight */}
                <div
                    ref={range}
                    className="absolute h-full bg-[#B88E2F] rounded-lg z-10"
                />

                {/* Inputs (Functional Layer) */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    onChange={(event) => {
                        const val = Math.min(Number(event.target.value), maxVal - 1);
                        setMinVal(val);
                        onChange([val, maxVal]);
                    }}
                    className="pointer-events-none absolute -top-1.5 h-4 w-full opacity-0 z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none"
                    style={{ zIndex: minVal > max - 100 ? 50 : 30 }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    onChange={(event) => {
                        const val = Math.max(Number(event.target.value), minVal + 1);
                        setMaxVal(val);
                        onChange([minVal, val]);
                    }}
                    className="pointer-events-none absolute -top-1.5 h-6 w-full opacity-0 z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none"
                    style={{ zIndex: 40 }}
                />

                {/* Visual Thumbs */}
                <div
                    className="absolute h-5 w-5 bg-white border-2 border-[#B88E2F] rounded-full shadow-md z-30 -mt-2 pointer-events-none transition-transform"
                    style={{ left: `calc(${getPercent(minVal)}% - 10px)` }}
                />
                <div
                    className="absolute h-5 w-5 bg-white border-2 border-[#B88E2F] rounded-full shadow-md z-30 -mt-2 pointer-events-none transition-transform"
                    style={{ left: `calc(${getPercent(maxVal)}% - 10px)` }}
                />
            </div>

            <div className="flex justify-between mt-3 text-sm font-medium text-gray-700 font-poppins">
                <span>₹{minVal}</span>
                <span>₹{maxVal}</span>
            </div>
        </div>
    );
};

export default PriceRangeSlider;
