'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import ListingCard, { ListingItem } from "@/components/ListingCard";

export default function MojeKonto() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();

    const [activeMenu, setActiveMenu] = useState<'ogloszenia' | 'profil'>('ogloszenia');
    const [activeTab, setActiveTab] = useState<'aktywne' | 'zakonczone' | 'obserwowane'>('aktywne');

    const [listings, setListings] = useState<ListingItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'obserwowane') {
            setActiveMenu('ogloszenia');
            setActiveTab('obserwowane');
        }
    }, [searchParams]);

    useEffect(() => {
        if (!session?.user?.id) return;
        if (activeMenu !== 'ogloszenia') return;

        setListings([]);

        if (activeTab === 'zakonczone') {
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/profile/listings?userId=${session!.user!.id}&type=${activeTab}`, {
                    cache: 'no-store'
                });

                if (res.ok) {
                    const data = await res.json();
                    setListings(data);
                } else {
                    console.error("Błąd pobierania danych");
                }
            } catch (error) {
                console.error("Błąd sieci:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [activeTab, activeMenu, session]);

    const handleDeleteListing = async (listingId: number) => {
        try {
            const res = await fetch(`/api/listings/${listingId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setListings((prev) => prev.filter((item) => item.id !== listingId));
            } else {
                alert("Wystąpił błąd podczas usuwania. Spróbuj ponownie.");
            }
        } catch (error) {
            console.error("Błąd usuwania:", error);
            alert("Błąd sieci.");
        }
    };

    const renderTabContent = () => {
        if (activeTab === 'zakonczone') {
            return <p className="text-gray-400 mt-4 text-center">Ta funkcja jest w przygotowaniu.</p>;
        }

        if (isLoading) {
            return <p className="text-white mt-4 text-center text-lg">Ładowanie ogłoszeń...</p>;
        }

        if (listings.length === 0) {
            return <p className="text-gray-400 mt-4 text-center">Brak ogłoszeń w tej zakładce.</p>;
        }

        return (
            <div className="flex flex-col items-center w-full mt-4 gap-2">
                {listings.map((listing) => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        currentUserId={session?.user?.id}
                        isFavourite={activeTab === 'obserwowane'}
                        onDelete={handleDeleteListing}
                    />
                ))}
            </div>
        );
    };

    const renderProfileContent = () => {
        return (
            <div className="flex justify-center w-full mt-8">
                <div className="bg-[#4A4345] p-8 rounded-xl w-full max-w-md shadow-lg border border-gray-600">
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-500 pb-2">Twój Profil</h2>

                    <div className="flex items-center gap-4 mb-6">
                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt="Avatar"
                                className="w-20 h-20 rounded-full border-2 border-[#1EA6D8]"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-3xl font-bold text-white">
                                {session?.user?.name?.[0]}
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-400">Użytkownik</p>
                            <p className="text-xl font-semibold text-white">{session?.user?.name}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-400">Adres email</p>
                            <p className="text-lg text-white">{session?.user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#2C2628]">
            <div className="bg-[#3A3335] w-full shadow-xl z-10 border-b border-gray-700">
                <div className="max-w-6xl mx-auto flex justify-start px-6 py-6 gap-10 md:gap-20">
                    <button
                        className={`text-xl transition-all pb-1 ${
                            activeMenu === 'ogloszenia'
                                ? 'font-bold text-[#1EA6D8] border-b-2 border-[#1EA6D8]'
                                : 'font-medium text-gray-300 hover:text-white'
                        }`}
                        onClick={() => setActiveMenu('ogloszenia')}
                    >
                        Ogłoszenia
                    </button>
                    <button
                        className={`text-xl transition-all pb-1 ${
                            activeMenu === 'profil'
                                ? 'font-bold text-[#1EA6D8] border-b-2 border-[#1EA6D8]'
                                : 'font-medium text-gray-300 hover:text-white'
                        }`}
                        onClick={() => setActiveMenu('profil')}
                    >
                        Profil
                    </button>
                </div>
            </div>
            {activeMenu === 'ogloszenia' && (
                <div className="max-w-6xl mx-auto w-full p-4 mt-6">
                    <div className="bg-[#3A3335] p-4 rounded-xl shadow-lg min-h-[500px]">
                        <div className="flex flex-wrap gap-6 md:gap-10 border-b border-gray-600 pb-2 px-2 mb-4">
                            <button
                                onClick={() => setActiveTab('aktywne')}
                                className={`pb-2 transition-colors ${
                                    activeTab === 'aktywne'
                                        ? 'text-[#1EA6D8] font-bold border-b-2 border-[#1EA6D8] -mb-[9px]'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Aktywne
                            </button>
                            <button
                                onClick={() => setActiveTab('zakonczone')}
                                className={`pb-2 transition-colors ${
                                    activeTab === 'zakonczone'
                                        ? 'text-[#1EA6D8] font-bold border-b-2 border-[#1EA6D8] -mb-[9px]'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Zakończone
                            </button>
                            <button
                                onClick={() => setActiveTab('obserwowane')}
                                className={`pb-2 transition-colors ${
                                    activeTab === 'obserwowane'
                                        ? 'text-[#1EA6D8] font-bold border-b-2 border-[#1EA6D8] -mb-[9px]'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Obserwowane
                            </button>
                        </div>
                        <div className="w-full">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            )}
            {activeMenu === 'profil' && (
                <div className="max-w-6xl mx-auto w-full p-4 mt-6">
                    {renderProfileContent()}
                </div>
            )}
        </div>
    );
}