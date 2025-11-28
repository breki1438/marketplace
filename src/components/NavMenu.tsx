"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NavMenu() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleAddListing = () => {
        setIsMobileMenuOpen(false);
        if (session) {
            router.push("/add-listing");
        } else {
            signIn("google", { callbackUrl: "/add-listing", prompt: "select_account" });
        }
    };

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <nav className="bg-[#1EA6D8] sticky top-0 w-full z-50 shadow-lg transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center gap-8">
                        <Link
                            href="/"
                            className="text-white text-2xl font-extrabold tracking-tight hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <span className="bg-white text-[#1EA6D8] rounded-lg px-2 py-0.5 shadow-sm text-xl">M</span>
                            MarketPlace
                        </Link>
                        <div className="hidden md:flex space-x-4">
                            <Link
                                href="/all-listings"
                                className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Wszystkie ogłoszenia
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={handleAddListing}
                            className="bg-white text-[#1EA6D8] px-5 py-2 rounded-full font-bold text-sm shadow-sm hover:shadow-md hover:bg-gray-50 transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            + Dodaj ogłoszenie
                        </button>
                        <Link
                            href="/moje-konto?tab=obserwowane"
                            className="group relative p-2"
                            title="Moje obserwowane"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-6 h-6 text-white group-hover:scale-110 transition-transform group-hover:fill-white/20"
                            >
                                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                            </svg>
                        </Link>

                        <div className="w-px h-6 bg-white/30 mx-1"></div>
                        {session ? (
                            <div className="flex items-center gap-3">
                                <Link href="/moje-konto" className="flex items-center gap-2 group">
                                    <span className="text-white font-medium text-sm group-hover:underline">
                                        {session.user?.name?.split(" ")[0]}
                                    </span>
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt="Avatar"
                                            className="w-9 h-9 rounded-full border-2 border-white/50 group-hover:border-white transition-colors object-cover"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border-2 border-white/50">
                                            {session.user?.name?.[0]}
                                        </div>
                                    )}
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="text-white/70 hover:text-white text-xs font-medium uppercase tracking-wide transition-colors ml-2"
                                >
                                    Wyloguj
                                </button>
                            </div>
                        ) : (
                            <button
                                className="text-white font-medium hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
                                onClick={() => signIn("google", { prompt: "select_account" })}
                            >
                                Zaloguj się
                            </button>
                        )}
                    </div>
                    <div className="flex md:hidden items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-white hover:text-gray-200 focus:outline-none p-2"
                            aria-label="Otwórz menu"
                        >
                            {!isMobileMenuOpen ? (
                                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="md:hidden bg-[#1895C4] border-t border-white/10 shadow-inner">
                    <div className="px-4 pt-2 pb-4 space-y-2">
                        {session && (
                            <div className="flex items-center gap-3 p-3 mb-2 bg-white/10 rounded-lg">
                                {session.user?.image && (
                                    <img src={session.user.image} alt="Avatar" className="w-10 h-10 rounded-full border border-white" />
                                )}
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">{session.user?.name}</span>
                                    <span className="text-white/70 text-xs">{session.user?.email}</span>
                                </div>
                            </div>
                        )}

                        <Link
                            href="/all-listings"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium"
                        >
                            Wszystkie ogłoszenia
                        </Link>

                        <Link
                            href="/moje-konto?tab=obserwowane"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                            </svg>
                            Ulubione
                        </Link>

                        <Link
                            href="/moje-konto"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium"
                        >
                            Mój Profil
                        </Link>

                        <button
                            onClick={handleAddListing}
                            className="w-full mt-4 bg-white text-[#1EA6D8] px-4 py-3 rounded-lg font-bold text-center hover:bg-gray-100 shadow-md transition-colors"
                        >
                            + Dodaj ogłoszenie
                        </button>

                        {session ? (
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    signOut({ callbackUrl: "/" });
                                }}
                                className="w-full text-left text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium mt-2"
                            >
                                Wyloguj się
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    signIn("google");
                                }}
                                className="w-full bg-[#3A3335] text-white px-4 py-3 rounded-lg font-bold text-center mt-4 shadow-md"
                            >
                                Zaloguj się
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}