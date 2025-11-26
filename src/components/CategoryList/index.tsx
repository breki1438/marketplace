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
    categories: CategoryWithSubs[]; // Odbieramy dane jako props
}

export default function CategoryList({ categories }: CategoryListProps) {
    const submenuRef = useRef<HTMLDivElement | null>(null);

    const [activeCategory, setActiveCategory] = useState<CategoryWithSubs | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

    const handleClick = (e: React.MouseEvent, category: CategoryWithSubs) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();

        setActiveCategory((prev) => (prev?.id === category.id ? null : category));
        setMenuPosition({ x: rect.right + 10, y: rect.top });
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
        <div className="relative flex flex-col items-center justify-center p-4 bg-[#2C2628] min-h-[calc(100vh-56px)] top-0">
            <div className="bg-[#3A3335] p-4 rounded-xl drop-shadow-lg">
                <h1 className="text-2xl text-center font-bold mb-8 text-white">Kategorie</h1>

                <div className="grid grid-cols-6 gap-6">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category.name}
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