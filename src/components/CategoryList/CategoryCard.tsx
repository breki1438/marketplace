import React from "react";
import { getCategoryIconUrl } from "@/lib/utils";

interface CategoryCardProps {
    categoryName: string;
    iconName: string | null;
    onClick: (e: React.MouseEvent) => void;
}

export default function CategoryCard({ categoryName, iconName, onClick }: CategoryCardProps) {
    const iconUrl = getCategoryIconUrl(iconName);

    return (
        <div
            onClick={onClick}
            className="group flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-2"
        >
            <div className="bg-[#F7F4F3] w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:bg-[#1EA6D8] group-hover:shadow-[#1EA6D8]/50 mb-3 overflow-hidden">
                <img
                    src={iconUrl}
                    alt={categoryName}
                    className="w-3/4 h-3/4 object-contain transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                />
            </div>
            <h2 className="text-sm sm:text-base font-semibold text-white text-center drop-shadow-md group-hover:text-[#1EA6D8] transition-colors">
                {categoryName}
            </h2>
        </div>
    );
}