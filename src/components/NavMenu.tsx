"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function NavMenu() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleAddListing = () => {
        if (session) {
            router.push("/add-listing");
        } else {
            signIn("google", { callbackUrl: "/add-listing", prompt: "select_account" });
        }
    };

    return (
        <nav className="bg-[#1EA6D8] sticky top-0 w-full z-50 shadow-md">
            <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-white text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
                        MarketPlace
                    </Link>

                    <div className="hidden md:flex gap-4 text-white font-medium text-sm">
                        <Link href="/all-listings" className="hover:text-gray-200 transition-colors">
                            Wszystkie ogłoszenia
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleAddListing}
                        className="bg-white text-[#1EA6D8] px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition shadow-sm"
                    >
                        + Dodaj ogłoszenie
                    </button>
                    <Link
                        href="/moje-konto?tab=obserwowane"
                        className="group"
                        title="Moje obserwowane"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-6 h-6 group-hover:scale-110 transition-transform group-hover:fill-white/20"
                        >
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                        </svg>
                    </Link>

                    <div className="w-px h-6 bg-white/30 mx-1"></div>

                    {session ? (
                        <div className="flex items-center gap-3">
                            <Link href="/moje-konto" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <span className="text-white font-medium text-sm hidden sm:block">
                                    {session.user?.name?.split(" ")[0]}
                                </span>
                                {session.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full border-2 border-white"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                                        {session.user?.name?.[0]}
                                    </div>
                                )}
                            </Link>

                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                            >
                                Wyloguj
                            </button>
                        </div>
                    ) : (
                        <button
                            className="text-white font-medium hover:text-gray-200 transition-colors"
                            onClick={() => signIn("google", { prompt: "select_account" })}
                        >
                            Zaloguj się
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}