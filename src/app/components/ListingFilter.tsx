import React, { useState } from "react";

export type SortOption = "newest" | "oldest" | "cheapest" | "expensive";

type FilterProps = {
    onFilterChange: (minPrice: number | null, maxPrice: number | null, searchQuery: string) => void;
    onSortChange: (sort: SortOption) => void;
};

export default function ListingFilter({ onFilterChange, onSortChange }: FilterProps) {
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedSort, setSelectedSort] = useState<SortOption>("newest");

    // Helper: Validation for numbers
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setter(value);
        }
    };

    // --- THE CORE LOGIC ---
    // This function sends the CURRENT state of all inputs to the parent.
    // We call this whenever we want to refresh the list (Search button, Price Blur, Price Enter).
    const triggerUpdate = () => {
        const min = minPrice === "" ? null : parseInt(minPrice, 10);
        const max = maxPrice === "" ? null : parseInt(maxPrice, 10);
        onFilterChange(min, max, searchQuery);
    };

    const resetFilter = () => {
        setMinPrice("");
        setMaxPrice("");
        setSearchQuery("");
        setSelectedSort("newest");
        onFilterChange(null, null, "");
        onSortChange("newest");
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as SortOption;
        setSelectedSort(value);
        onSortChange(value);
    };

    // Handle "Enter" key for all inputs
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") triggerUpdate();
    };

    return (
        <div className="bg-[#3A3335] p-4 rounded-xl mb-6 flex flex-col lg:flex-row items-center gap-4 w-full max-w-6xl text-white">

            {/* 1. Search Section (Input + Button grouped) */}
            <div className="flex flex-col w-full lg:w-auto flex-grow">
                <p className="ml-1 text-sm font-bold mb-1">Szukaj</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown} // Search on Enter
                        placeholder="Np. Audi A4..."
                        className="bg-[#EBEBEB] text-black rounded-xl p-2 w-full placeholder-gray-500"
                    />
                    <button
                        onClick={triggerUpdate}
                        className="bg-[#1EA6D8] text-white px-6 py-2 rounded-xl hover:bg-[#1593bf] transition font-medium"
                    >
                        Szukaj
                    </button>
                </div>
            </div>

            {/* 2. Price Section (Auto-update on Blur/Enter) */}
            <div className="flex flex-col">
                <p className="ml-1 text-sm font-bold mb-1">Cena (PLN)</p>
                <div className="flex items-center">
                    <input
                        type="text"
                        value={minPrice}
                        onChange={(e) => handlePriceChange(e, setMinPrice)}
                        onBlur={triggerUpdate}       // Update when user clicks away
                        onKeyDown={handleKeyDown}    // Update when user hits Enter
                        className="bg-[#EBEBEB] rounded-xl p-2 text-black w-24 mr-2 placeholder-gray-500"
                        placeholder="Od"
                    />
                    <span className="mr-2">-</span>
                    <input
                        type="text"
                        value={maxPrice}
                        onChange={(e) => handlePriceChange(e, setMaxPrice)}
                        onBlur={triggerUpdate}       // Update when user clicks away
                        onKeyDown={handleKeyDown}    // Update when user hits Enter
                        className="bg-[#EBEBEB] rounded-xl p-2 text-black w-24 placeholder-gray-500"
                        placeholder="Do"
                    />
                </div>
            </div>

            {/* 3. Sort Dropdown */}
            <div className="flex flex-col">
                <p className="ml-1 text-sm font-bold mb-1">Sortowanie</p>
                <select
                    value={selectedSort}
                    onChange={handleSortChange}
                    className="bg-[#EBEBEB] text-black rounded-xl p-2 w-40 h-[42px] cursor-pointer"
                >
                    <option value="newest">Najnowsze</option>
                    <option value="oldest">Najstarsze</option>
                    <option value="cheapest">Najtańsze</option>
                    <option value="expensive">Najdroższe</option>
                </select>
            </div>

            {/* 4. Reset Button */}
            <div className="flex h-[42px] items-end">
                <button
                    onClick={resetFilter}
                    className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition h-full"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}