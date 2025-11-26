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

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        const value = e.target.value;
        if (value === "" || /^\d+$/.test(value)) {
            setter(value);
        }
    };

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            triggerUpdate();
            (e.target as HTMLElement).blur();
        }
    };

    const inputClasses = "bg-[#EBEBEB] text-black rounded-xl p-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1EA6D8] transition-shadow h-[42px]";

    return (
        <div className="bg-[#3A3335] p-4 rounded-xl mb-6 flex flex-col lg:flex-row items-end gap-4 w-full max-w-6xl text-white shadow-lg">
            <div className="flex flex-col w-full lg:flex-grow">
                <label htmlFor="search-input" className="ml-1 text-sm font-bold mb-1 block">
                    Szukaj
                </label>
                <div className="flex gap-2 w-full">
                    <input
                        id="search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Np. Audi A4..."
                        className={`${inputClasses} w-full`}
                    />
                    <button
                        onClick={triggerUpdate}
                        className="bg-[#1EA6D8] text-white px-6 rounded-xl hover:bg-[#1593bf] transition font-medium h-[42px] flex items-center justify-center focus:ring-2 focus:ring-white focus:outline-none"
                    >
                        Szukaj
                    </button>
                </div>
            </div>
            <div className="flex flex-col w-full sm:w-auto">
                <label className="ml-1 text-sm font-bold mb-1 block">
                    Cena (PLN)
                </label>
                <div className="flex items-center gap-2">
                    <input
                        aria-label="Cena minimalna"
                        type="text"
                        value={minPrice}
                        onChange={(e) => handlePriceChange(e, setMinPrice)}
                        onBlur={triggerUpdate}
                        onKeyDown={handleKeyDown}
                        className={`${inputClasses} w-24 text-center`}
                        placeholder="Od"
                    />
                    <span className="font-bold text-gray-400">-</span>
                    <input
                        aria-label="Cena maksymalna"
                        type="text"
                        value={maxPrice}
                        onChange={(e) => handlePriceChange(e, setMaxPrice)}
                        onBlur={triggerUpdate}
                        onKeyDown={handleKeyDown}
                        className={`${inputClasses} w-24 text-center`}
                        placeholder="Do"
                    />
                </div>
            </div>
            <div className="flex flex-col w-full sm:w-auto">
                <label htmlFor="sort-select" className="ml-1 text-sm font-bold mb-1 block">
                    Sortowanie
                </label>
                <select
                    id="sort-select"
                    value={selectedSort}
                    onChange={handleSortChange}
                    className={`${inputClasses} w-full sm:w-40 cursor-pointer`}
                >
                    <option value="newest">Najnowsze</option>
                    <option value="oldest">Najstarsze</option>
                    <option value="cheapest">Najtańsze</option>
                    <option value="expensive">Najdroższe</option>
                </select>
            </div>
            <div className="flex w-full sm:w-auto">
                <button
                    onClick={resetFilter}
                    className="bg-gray-600 text-white px-4 rounded-xl hover:bg-gray-500 transition h-[42px] w-full sm:w-auto flex items-center justify-center focus:ring-2 focus:ring-gray-400 focus:outline-none"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}