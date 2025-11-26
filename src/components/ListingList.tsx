'use client';

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ListingFilter, { SortOption } from "../components/ListingFilter";
import ListingCard, { ListingItem } from "../components/ListingCard";

interface ListingListProps {
    categorySlug?: string;
    subcategorySlug?: string;
    categoryName?: string;
    subcategoryName?: string;
    initialListings?: ListingItem[];
}

const formatSlug = (slug: string) => {
    if (!slug) return "";
    const text = decodeURIComponent(slug).replace(/-/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
};

export default function ListingList({
                                        categorySlug,
                                        subcategorySlug,
                                        categoryName,
                                        subcategoryName,
                                        initialListings = []
                                    }: ListingListProps) {
    const { data: session } = useSession();

    const [listings, setListings] = useState<ListingItem[]>(initialListings);
    const [quickAccessItems, setQuickAccessItems] = useState<any[]>([]);
    const [favouritesIds, setFavouritesIds] = useState<number[]>([]);

    const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
    const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortMode, setSortMode] = useState<SortOption>("newest");

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!searchQuery && listings.length > 0 && listings === initialListings) {
        }

        async function fetchListings() {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (categorySlug) params.append("category", categorySlug);
                if (subcategorySlug) params.append("subcategory", subcategorySlug);
                if (searchQuery) params.append("search", searchQuery);

                const res = await fetch(`/api/listings?${params.toString()}`, { cache: "no-store" });

                if (res.ok) {
                    const data = await res.json();
                    setListings(data);
                } else {
                    console.error("Server error");
                    setListings([]);
                }
            } catch (error) {
                console.error("Error fetching listings:", error);
                setListings([]);
            } finally {
                setIsLoading(false);
            }
        }

        if (searchQuery || categorySlug || subcategorySlug) {
            fetchListings();
        }

    }, [categorySlug, subcategorySlug, searchQuery]);

    useEffect(() => {
        async function fetchNavigationItems() {
            try {
                const url = categorySlug
                    ? `/api/category-details?slug=${categorySlug}`
                    : `/api/categories`;

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setQuickAccessItems(categorySlug ? (data.subcategories || []) : data);
                }
            } catch (error) {
                console.error("Error fetching nav items:", error);
            }
        }
        fetchNavigationItems();
    }, [categorySlug]);

    useEffect(() => {
        if (!session?.user?.id) {
            setFavouritesIds([]);
            return;
        }
        async function fetchFavourites() {
            try {
                const res = await fetch(`/api/user-favourites`);
                if (res.ok) {
                    const data = await res.json();
                    setFavouritesIds(data.map((fav: any) => fav.listingId));
                }
            } catch (error) {
                console.error("Error fetching favourites", error);
            }
        }
        fetchFavourites();
    }, [session]);

    const processedListings = useMemo(() => {
        let result = [...listings];

        if (minPriceFilter !== null) {
            result = result.filter(l => l.price >= minPriceFilter);
        }
        if (maxPriceFilter !== null) {
            result = result.filter(l => l.price <= maxPriceFilter);
        }

        result.sort((a, b) => {
            switch (sortMode) {
                case "cheapest": return a.price - b.price;
                case "expensive": return b.price - a.price;
                case "newest": return b.id - a.id;
                case "oldest": return a.id - b.id;
                default: return 0;
            }
        });

        return result;
    }, [listings, minPriceFilter, maxPriceFilter, sortMode]);

    return (
        <div className="flex flex-col items-center bg-[#2C2628] py-5 z-0 w-full max-w-6xl mx-auto min-h-screen">

            <ListingFilter
                onFilterChange={(min, max, search) => {
                    setMinPriceFilter(min);
                    setMaxPriceFilter(max);
                    setSearchQuery(search);
                }}
                onSortChange={setSortMode}
            />

            <div className="w-full mb-6 text-center mt-4">
                <h1 className="text-3xl font-bold text-white mb-2">
                    {categorySlug
                        ? subcategorySlug
                            ? `Kategoria: ${subcategoryName || formatSlug(subcategorySlug)}`
                            : `Kategoria: ${categoryName || formatSlug(categorySlug)}`
                        : "Wszystkie ogłoszenia"}
                </h1>

                <div className="flex items-center justify-center gap-2 text-gray-300 text-sm mb-4">
                    <Link href="/" className="hover:text-blue-400 hover:underline transition">Strona Główna</Link>

                    {categorySlug && (
                        <>
                            <span>/</span>
                            {subcategorySlug ? (
                                <Link
                                    href={`/kategoria/${categorySlug}`}
                                    className="hover:text-blue-400 hover:underline transition"
                                >
                                    {categoryName || formatSlug(categorySlug)}
                                </Link>
                            ) : (
                                <span className="text-gray-500 cursor-default">
                                    {categoryName || formatSlug(categorySlug)}
                                </span>
                            )}
                        </>
                    )}

                    {subcategorySlug && (
                        <>
                            <span>/</span>
                            <span className="text-gray-500 cursor-default">
                                {subcategoryName || formatSlug(subcategorySlug)}
                            </span>
                        </>
                    )}
                </div>

                {quickAccessItems.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mt-2 px-4">
                        {quickAccessItems.map((item) => {
                            const linkHref = categorySlug
                                ? `/kategoria/${categorySlug}/${item.slug}`
                                : `/kategoria/${item.slug}`;
                            const isActive = item.slug === subcategorySlug;

                            return (
                                <Link
                                    key={item.id}
                                    href={linkHref}
                                    className={`px-4 py-1 rounded-full text-sm transition border ${
                                        isActive
                                            ? "bg-blue-600 border-blue-600 text-white"
                                            : "bg-[#3A3335] border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {isLoading ? (
                <p className="text-white mt-10 text-xl">Ładowanie ogłoszeń...</p>
            ) : processedListings.length === 0 ? (
                <p className="text-white mt-10 text-lg">Brak ogłoszeń spełniających kryteria.</p>
            ) : (
                <div className="w-full flex flex-col items-center">
                    {processedListings.map((listing) => (
                        <ListingCard
                            key={listing.id}
                            listing={listing}
                            currentUserId={session?.user?.id}
                            isFavourite={favouritesIds.includes(listing.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}