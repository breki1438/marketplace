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
                className="absolute bg-[#2C2628] border border-[#F7F4F3] rounded-lg shadow-lg p-4 z-50"
                style={{ top: position.y, left: position.x }}
            >
                <ul className="flex flex-col gap-1">
                    <Link href={`/kategoria/${parentSlug}`}>
                        <li className="hover:text-blue-400 text-white cursor-pointer py-1">
                            {">"} Wszystkie ogłoszenia w <span className="font-semibold">{parentName}</span>
                        </li>
                    </Link>
                    <li><div className="w-full h-px bg-white my-2" /></li>
                    {items.map((sub) => (
                        <Link
                            key={sub.id}
                            href={`/kategoria/${parentSlug}/${sub.slug}`}
                        >
                            <li className="hover:text-blue-400 text-white cursor-pointer py-1">
                                {">"} {sub.name}
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