import { forwardRef } from "react";
import Link from "next/link";

interface SubCategoryItem {
    id: string;
    name: string;
    slug: string;
}

interface SubmenuProps {
    parentSlug: string;
    parentName: string;
    items: SubCategoryItem[];
    position: { x: number; y: number };
}

const Submenu = forwardRef<HTMLDivElement, SubmenuProps>(
    ({ parentSlug, parentName, items, position }, ref) => {
        return (
            <div
                ref={ref}
                className="absolute bg-[#2C2628]/95 backdrop-blur-md border border-[#1EA6D8]/30 rounded-xl shadow-2xl p-2 z-50 min-w-[220px]"
                style={{ top: position.y, left: position.x }}
            >
                <ul className="flex flex-col">
                    <Link href={`/kategoria/${parentSlug}`} className="block">
                        <li className="px-4 py-2 text-sm text-gray-200 hover:text-white hover:bg-[#1EA6D8]/20 rounded-lg transition-colors cursor-pointer flex items-center">
                            <span className="text-[#1EA6D8] mr-2">●</span>
                            Wszystkie w <span className="font-bold text-white ml-1">{parentName}</span>
                        </li>
                    </Link>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                    {items.map((sub) => (
                        <Link
                            key={sub.id}
                            href={`/kategoria/${parentSlug}/${sub.slug}`}
                            className="block"
                        >
                            <li className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                                {sub.name}
                            </li>
                        </Link>
                    ))}
                </ul>
            </div>
        );
    }
);

Submenu.displayName = "Submenu";
export default Submenu;