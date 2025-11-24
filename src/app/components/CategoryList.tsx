"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function CategoryList() {
    const categoryList = [
        "Motoryzacja",
        "Dom i Ogród",
        "Elektronika",
        "Moda",
        "Dla Dzieci",
        "Sport i Hobby",
        "Muzyka i Edukacja",
        "Zdrowie i Uroda",
        "Gastronomia"
    ];

    const createSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/ł/g, 'l')
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const submenuRef = useRef<HTMLDivElement | null>(null);

    const subcategories: { [key: string]: string[] } = {
        Motoryzacja: ["Samochody", "Motocykle", "Części", "Akcesoria", "Opony", "Narzędzia"],
        "Dom i Ogród": ["Meble", "Narzędzia ogrodowe", "Dekoracje", "Oświetlenie", "AGD", "Ogrzewanie"],
        Elektronika: ["Telewizory", "Laptopy", "Telefony", "Aparaty", "Konsole", "Audio"],
        Moda: ["Koszulki", "Buty", "Spodnie", "Sukienki", "Kurtki", "Akcesoria"],
        "Dla Dzieci": ["Zabawki", "Wózki", "Ubranka", "Foteliki", "Książeczki", "Edukacyjne"],
        "Sport i Hobby": ["Fitness", "Rower", "Turystyka", "Wędkarstwo", "Modelarstwo", "Gry planszowe"],
        "Muzyka i Edukacja": ["Instrumenty", "Płyty", "Książki", "Korepetycje", "Sprzęt audio", "Szkoły i kursy"],
        "Zdrowie i Uroda": ["Kosmetyki", "Suplementy", "Sprzęt medyczny", "Perfumy", "Fryzjerstwo", "Fitness i wellness"],
        Gastronomia: ["Sprzęt gastronomiczny", "Produkty spożywcze", "Napoje", "Wyposażenie lokali", "Kawa i herbata", "Usługi cateringowe"]
    };

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

    const handleClick = (e: React.MouseEvent, category: string) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setActiveCategory((prev) => (prev === category ? null : category));
        setMenuPosition({ x: rect.right + 10, y: rect.top });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
                setActiveCategory(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center p-4 bg-[#2C2628] min-h-[calc(100vh-56px)] top-0">
            <div className="bg-[#3A3335] p-4 rounded-xl drop-shadow-lg">
                <h1 className="text-2xl text-center font-bold mb-8 text-white">Kategorie</h1>
                <div className="grid grid-cols-6 gap-6">
                    {categoryList.map((category, index) => (
                        <div
                            key={index}
                            onClick={(e) => handleClick(e, category)}
                            className="flex-row items-center justify-center m-auto text-center rounded-full cursor-pointer"
                        >
                            <div className="bg-[#F7F4F3] w-20 h-20 rounded-full hover:bg-[#1EA6D8] transition-colors m-auto mb-3 drop-shadow-2xl">
                                <img
                                    src={`/images/categories/${category.toLowerCase()}.png`}
                                    alt={category}
                                    className="w-12 h-12 mx-auto mt-2"
                                />
                            </div>
                            <h2 className="text-lg font-semibold text-white m-auto drop-shadow-2xl">
                                {category}
                            </h2>
                        </div>
                    ))}
                </div>
            </div>

            {activeCategory && subcategories[activeCategory] && menuPosition && (
                <div
                    ref={submenuRef}
                    className="absolute bg-[#2C2628] border border-[#F7F4F3] rounded-lg shadow-lg p-4 z-50"
                    style={{ top: menuPosition.y, left: menuPosition.x }}
                >
                    <ul className="flex flex-col gap-1"> {/* Added flex for better spacing */}
                        <Link href={`/kategoria/${createSlug(activeCategory)}`}>
                            <li className="hover:text-blue-400 text-white cursor-pointer py-1">
                                {">"} Wszystkie ogłoszenia w <span className="font-semibold">{activeCategory}</span>
                            </li>
                        </Link>
                        <li>
                            <div className="w-full h-px bg-white my-2" />
                        </li>
                        {subcategories[activeCategory].map((sub, i) => (
                            <Link
                                key={i}
                                href={`/kategoria/${createSlug(activeCategory)}/${createSlug(sub)}`}
                            >
                                <li className="hover:text-blue-400 text-white cursor-pointer py-1">
                                    {">"} {sub}
                                </li>
                            </Link>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
