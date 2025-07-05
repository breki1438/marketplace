'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AddToFavourites from "../components/AddToFavourites";
import Link from "next/link";
import ListingFilter from "../components/ListingFilter";

type SortMode = "default" | "asc" | "desc";

export default function ListingList() {
    const { data: session } = useSession();

    const [listings, setListings] = useState<any[]>([]);
    const [filteredListings, setFilteredListings] = useState<any[]>([]);
    const [favouritesIds, setFavouritesIds] = useState<number[]>([]);
    const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
    const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
    const [sortMode, setSortMode] = useState<SortMode>("default");

    useEffect(() => {
        async function fetchListings() {
            try {
                const res = await fetch("/api/listings", { cache: "no-store" });
                const data = await res.json();
                setListings(data);
                setFilteredListings(data);
            } catch (error) {
                console.error("Błąd pobierania listingów:", error);
            }
        }
        fetchListings();
    }, []);

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
                console.error("Błąd pobierania ulubionych:", error);
            }
        }
        fetchFavourites();
    }, [session]);

    useEffect(() => {
        let filtered = listings;

        if (minPriceFilter !== null) {
            filtered = filtered.filter(l => l.price >= minPriceFilter);
        }
        if (maxPriceFilter !== null) {
            filtered = filtered.filter(l => l.price <= maxPriceFilter);
        }

        if (sortMode === "asc") {
            filtered = filtered.slice().sort((a, b) => a.price - b.price);
        } else if (sortMode === "desc") {
            filtered = filtered.slice().sort((a, b) => b.price - a.price);
        }

        setFilteredListings(filtered);
    }, [minPriceFilter, maxPriceFilter, sortMode, listings]);

    const cycleSortMode = () => {
        if (sortMode === "default") setSortMode("asc");
        else if (sortMode === "asc") setSortMode("desc");
        else setSortMode("default");
    };

    const sortButtonText = {
        default: "Domyślnie",
        asc: "Od najtańszego",
        desc: "Od najdroższego",
    };

    return (
        <div className="flex flex-col items-center bg-[#2C2628] py-5 z-0 w-full max-w-5xl mx-auto">
            <div className="flex gap-4 items-center w-full max-w-md mb-6">
                <ListingFilter
                    onFilterChange={(min, max) => {
                        setMinPriceFilter(min);
                        setMaxPriceFilter(max);
                    }}
                />
                <div>
                    <p className="text-white mb-1">Sortowanie</p>
                    <select
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value as SortMode)}
                        className="bg-gray-200 text-black px-4 py-1 rounded-md hover:bg-gray-300 transition"
                    >
                        <option value="default">Domyślnie</option>
                        <option value="asc">Od najtańszego</option>
                        <option value="desc">Od najdroższego</option>
                    </select>
                </div>
            </div>

            {filteredListings.length === 0 && (
                <p className="text-white mt-4">Brak ogłoszeń spełniających kryteria.</p>
            )}

            {filteredListings.map((listing: any) => (
                <Link
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="bg-[#3A3335] p-2 w-full m-2 rounded-xl border border-[#D9D9D9] drop-shadow-xl flex gap-4 hover:bg-gray-500 transition"
                >
                    {listing.imageUrl && (
                        <img
                            src={listing.imageUrl}
                            alt={listing.title}
                            width={192}
                            height={192}
                            className="rounded-xl drop-shadow-xl object-cover"
                        />
                    )}
                    <div className="flex flex-col text-left justify-between w-full">
                        <div className="w-full flex flex-row justify-between mt-0 m-auto p-1 items-center">
                            <span className="font-medium drop-shadow-xl text-2xl">{listing.title}</span>
                            {session && listing.userId !== session?.user?.id && (
                                <AddToFavourites
                                    listingId={listing.id}
                                    userId={session?.user?.id}
                                    isFavourite={favouritesIds.includes(listing.id)}
                                />
                            )}
                        </div>
                        <div className="w-full flex flex-row justify-between mb-0 m-auto p-1 items-end">
                            <p className="font-medium drop-shadow-xl text-2xl">{listing.price}zł</p>
                            <p className="text-[#A6A6A6]">Rzeszów - 15 maja 2025</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
