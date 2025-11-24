'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AddToFavourites from "../components/AddToFavourites";
import Link from "next/link";
import ListingFilter, { SortOption } from "../components/ListingFilter";

// Props received from the parent Page component
interface ListingListProps {
    categorySlug?: string;     // Undefined on "All Listings" page
    subcategorySlug?: string;  // Undefined on "All Listings" and "Main Category" pages
}

// Helper to turn "dom-i-ogrod" into "Dom i Ogrod"
const formatSlug = (slug: string) => {
    return decodeURIComponent(slug).replace(/-/g, ' ');
};

export default function ListingList({ categorySlug, subcategorySlug }: ListingListProps) {
    const { data: session } = useSession();

    // --- Data States ---
    const [listings, setListings] = useState<any[]>([]);
    const [filteredListings, setFilteredListings] = useState<any[]>([]);
    // Holds either Main Categories (if on home) OR Subcategories (if on category page)
    const [quickAccessItems, setQuickAccessItems] = useState<any[]>([]);
    const [favouritesIds, setFavouritesIds] = useState<number[]>([]);

    // --- Filter & Search States ---
    const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
    const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(""); // State for text search
    const [sortMode, setSortMode] = useState<SortOption>("newest");

    // --- UI States ---
    const [isLoading, setIsLoading] = useState(true);

    // -------------------------------------------
    // 1. Fetch Listings (Triggers on URL change or Search)
    // -------------------------------------------
    useEffect(() => {
        async function fetchListings() {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();

                // Append URL parameters
                if (categorySlug) params.append("category", categorySlug);
                if (subcategorySlug) params.append("subcategory", subcategorySlug);

                // Append Search parameter (Server-side filtering)
                if (searchQuery) params.append("search", searchQuery);

                // Fetch data
                const res = await fetch(`/api/listings?${params.toString()}`, { cache: "no-store" });
                const data = await res.json();

                setListings(data);
                setFilteredListings(data);
            } catch (error) {
                console.error("Error fetching listings:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchListings();
    }, [categorySlug, subcategorySlug, searchQuery]);

    // -------------------------------------------
    // 2. Fetch Navigation Items (Categories or Subcategories)
    // -------------------------------------------
    useEffect(() => {
        async function fetchNavigationItems() {
            try {
                if (categorySlug) {
                    // SCENARIO A: User is in a Category -> Fetch its Subcategories
                    const res = await fetch(`/api/category-details?slug=${categorySlug}`);
                    if (res.ok) {
                        const data = await res.json();
                        setQuickAccessItems(data.subcategories || []);
                    }
                } else {
                    // SCENARIO B: User is on All Listings -> Fetch ALL Main Categories
                    const res = await fetch(`/api/categories`);
                    if (res.ok) {
                        const data = await res.json();
                        setQuickAccessItems(data || []);
                    }
                }
            } catch (error) {
                console.error("Error fetching navigation items:", error);
            }
        }
        fetchNavigationItems();
    }, [categorySlug]);

    // -------------------------------------------
    // 3. User Favorites Logic
    // -------------------------------------------
    useEffect(() => {
        if (!session) {
            setFavouritesIds([]);
            return;
        }
        async function fetchFavourites() {
            try {
                const res = await fetch(`/api/user-favourites?userId=${session?.user?.id}`, { cache: "no-store" });
                const data = await res.json();
                setFavouritesIds(data.map((fav: any) => fav.listingId));
            } catch (error) {
                console.error("Error fetching favourites:", error);
            }
        }
        fetchFavourites();
    }, [session]);

    // -------------------------------------------
    // 4. Local Filtering (Price) & Sorting
    // -------------------------------------------
    useEffect(() => {
        let filtered = listings;

        // Filter by Price (Client-side is fine for the fetched batch)
        if (minPriceFilter !== null) {
            filtered = filtered.filter(l => l.price >= minPriceFilter);
        }
        if (maxPriceFilter !== null) {
            filtered = filtered.filter(l => l.price <= maxPriceFilter);
        }

        // Sorting Logic
        filtered = filtered.slice().sort((a, b) => {
            switch (sortMode) {
                case "cheapest":
                    return a.price - b.price;
                case "expensive":
                    return b.price - a.price;
                case "newest":
                    // Assumes higher ID is newer. Replace with date comparison if available.
                    return b.id - a.id;
                case "oldest":
                    return a.id - b.id;
                default:
                    return 0;
            }
        });

        setFilteredListings(filtered);
    }, [minPriceFilter, maxPriceFilter, sortMode, listings]);


    // -------------------------------------------
    // RENDER
    // -------------------------------------------
    return (
        <div className="flex flex-col items-center bg-[#2C2628] py-5 z-0 w-full max-w-6xl mx-auto min-h-screen">

            {/* --- FILTERS & SEARCH BAR --- */}
            <ListingFilter
                onFilterChange={(min, max, search) => {
                    setMinPriceFilter(min);
                    setMaxPriceFilter(max);
                    setSearchQuery(search); // This triggers the API fetch
                }}
                onSortChange={(mode) => {
                    setSortMode(mode); // This triggers local sort
                }}
            />

            {/* --- HEADER & NAVIGATION SECTION --- */}
            <div className="w-full mb-6 text-center mt-4">
                <h1 className="text-3xl font-bold text-white mb-2 capitalize">
                    {categorySlug
                        ? subcategorySlug
                            ? `Kategoria: ${formatSlug(subcategorySlug)}`
                            : `Kategoria: ${formatSlug(categorySlug)}`
                        : "Wszystkie ogłoszenia"}
                </h1>

                {/* Breadcrumbs */}
                <div className="flex items-center justify-center gap-2 text-gray-300 text-sm mb-4">
                    {/* 1. Link to Home */}
                    <Link href="/" className="hover:text-blue-400 hover:underline transition">
                        Strona Główna
                    </Link>

                    {/* 2. Link to Main Category */}
                    {categorySlug && (
                        <>
                            <span>/</span>
                            {subcategorySlug ? (
                                <Link
                                    href={`/kategoria/${categorySlug}`}
                                    className="hover:text-blue-400 hover:underline transition capitalize"
                                >
                                    {formatSlug(categorySlug)}
                                </Link>
                            ) : (
                                <span className="text-gray-500 capitalize cursor-default">
                                    {formatSlug(categorySlug)}
                                </span>
                            )}
                        </>
                    )}

                    {/* 3. Current Subcategory (Static Text) */}
                    {subcategorySlug && (
                        <>
                            <span>/</span>
                            <span className="text-gray-500 capitalize cursor-default">
                                {formatSlug(subcategorySlug)}
                            </span>
                        </>
                    )}
                </div>

                {/* Quick Access Buttons (Categories OR Subcategories) */}
                {quickAccessItems.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mt-2 px-4">
                        {quickAccessItems.map((item) => {
                            // Calculate URL dynamically
                            // If we are already in a category -> Link to subcategory
                            // If we are on home page -> Link to main category
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
            {/* --- END HEADER SECTION --- */}


            {/* Loading State */}
            {isLoading && <p className="text-white mt-4 text-xl">Ładowanie ogłoszeń...</p>}

            {/* Empty State */}
            {!isLoading && filteredListings.length === 0 && (
                <p className="text-white mt-4">Brak ogłoszeń spełniających kryteria.</p>
            )}

            {/* Listings Map */}
            {!isLoading && filteredListings.map((listing: any) => (
                <Link
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="bg-[#3A3335] p-2 w-full m-2 rounded-xl border border-[#D9D9D9] drop-shadow-xl flex gap-4 hover:bg-gray-500 transition max-w-4xl"
                >
                    {listing.imageUrl ? (
                        <img
                            src={listing.imageUrl}
                            alt={listing.title}
                            className="rounded-xl drop-shadow-xl object-cover w-48 h-48 min-w-[192px]"
                        />
                    ) : (
                        <div className="w-48 h-48 min-w-[192px] bg-gray-600 rounded-xl flex items-center justify-center text-white">
                            No Image
                        </div>
                    )}
                    <div className="flex flex-col text-left justify-between w-full">
                        <div className="w-full flex flex-row justify-between mt-0 m-auto p-1 items-center">
                            <span className="font-medium drop-shadow-xl text-2xl text-white">{listing.title}</span>
                            {session && listing.userId !== session?.user?.id && (
                                <div onClick={(e) => e.preventDefault()}>
                                    <AddToFavourites
                                        listingId={listing.id}
                                        userId={session?.user?.id}
                                        isFavourite={favouritesIds.includes(listing.id)}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="w-full flex flex-row justify-between mb-0 m-auto p-1 items-end">
                            <p className="font-medium drop-shadow-xl text-2xl text-white">{listing.price}zł</p>
                            {/* You can format date here if you return createdAt from API */}
                            <p className="text-[#A6A6A6]">Rzeszów - 15 maja 2025</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}