"use client";

import { useState, useRef, useEffect } from "react";
import CategoryCard from "./CategoryCard";
import Submenu from "./Submenu";

export type CategoryWithSubs = {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    subcategories: {
        id: string;
        name: string;
        slug: string;
    }[];
};

interface CategoryListProps {
    categories: CategoryWithSubs[];
}

export default function CategoryList({ categories }: CategoryListProps) {
    const submenuRef = useRef<HTMLDivElement | null>(null);

    const [activeCategory, setActiveCategory] = useState<CategoryWithSubs | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

    const handleClick = (e: React.MouseEvent, category: CategoryWithSubs) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        setActiveCategory((prev) => (prev?.id === category.id ? null : category));

        const viewportWidth = window.innerWidth;
        const isMobile = viewportWidth < 768;

        const estimatedSubmenuWidth = 250;

        let xPos = 0;
        let yPos = 0;

        if (isMobile) {
            xPos = rect.left;
            yPos = rect.bottom + 10;
        } else {
            const spaceOnRight = viewportWidth - rect.right;

            if (spaceOnRight < estimatedSubmenuWidth) {
                xPos = rect.left - estimatedSubmenuWidth - 10;
            } else {
                xPos = rect.right + 10;
            }
            yPos = rect.top;
        }

        if (xPos < 10) xPos = 10;

        setMenuPosition({ x: xPos + window.scrollX, y: yPos + window.scrollY });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
                setActiveCategory(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center py-8 px-4 w-full">
            <div className="w-full max-w-6xl bg-[#3A3335] p-6 sm:p-8 rounded-2xl shadow-xl border border-white/5">
                <h1 className="text-2xl sm:text-3xl text-center font-bold mb-8 text-white tracking-wide">
                    Kategorie
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            categoryName={category.name}
                            iconName={category.icon}
                            onClick={(e) => handleClick(e, category)}
                        />
                    ))}
                </div>
            </div>

            {activeCategory && activeCategory.subcategories.length > 0 && menuPosition && (
                <Submenu
                    ref={submenuRef}
                    parentSlug={activeCategory.slug}
                    parentName={activeCategory.name}
                    items={activeCategory.subcategories}
                    position={menuPosition}
                />
            )}
        </div>
    );
}