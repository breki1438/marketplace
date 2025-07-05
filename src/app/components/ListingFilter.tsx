import React, { useState } from "react";

type PriceFilterProps = {
    onFilterChange: (minPrice: number | null, maxPrice: number | null) => void;
};

export default function ListingFilter({ onFilterChange }: PriceFilterProps) {
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // akceptuj tylko cyfry
            setMinPrice(value);
        }
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setMaxPrice(value);
        }
    };

    const applyFilter = () => {
        const min = minPrice === "" ? null : parseInt(minPrice, 10);
        const max = maxPrice === "" ? null : parseInt(maxPrice, 10);
        onFilterChange(min, max);
    };

    const resetFilter = () => {
        setMinPrice("");
        setMaxPrice("");
        onFilterChange(null, null);
    };

    return (
        <div className="bg-[#3A3335] p-4 rounded-xl mb-6 flex items-center gap-4 w-full max-w-6xl">
            <div className="flex flex-col">
                <p className="ml-1">Cena</p>
                <div className="flex">
                    <input
                        id="minPrice"
                        type="text"
                        value={minPrice}
                        onChange={handleMinChange}
                        className="bg-[#EBEBEB] m-2 rounded-xl p-1 rounded text-black w-20"
                        placeholder="Od"
                    />
                    <input
                        id="maxPrice"
                        type="text"
                        value={maxPrice}
                        onChange={handleMaxChange}
                        className="bg-[#EBEBEB] m-2 rounded-xl p-1 rounded text-black w-20"
                        placeholder="Do"
                    />
                </div>
            </div>
            <button
                onClick={applyFilter}
                className="bg-[#1EA6D8] text-white px-4 py-2 rounded hover:bg-[#1593bf]"
            >
                Filtruj
            </button>
            <button
                onClick={resetFilter}
                className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
            >
                Reset
            </button>
        </div>
    );
}