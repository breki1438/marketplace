"use client"

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
        <div className="flex justify-between items-center p-4 bg-[#1EA6D8] sticky top-0 w-full z-50">
            <div className="flex items-center space-x-4">
                <Link href={"/"}>Strona główna</Link>
                <Link href="/all-listings">Wszystkie ogłoszenia</Link>
                <Link href={"/my-listings"}>Moje ogłoszenia</Link>
                <button onClick={ handleAddListing }>Dodaj ogłoszenie</button>
            </div>
            <div className="flex items-center space-x-4">
                <Link href={"/favourites"}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6 hover:scale-110 transition-transform"
                    >
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                    </svg>
                </Link>
                {session ? (
                    <>
                        <Link href={"/mojekonto"}>{session.user?.name}</Link>
                        <button className="cursor-pointer" onClick={() => signOut()}>Sign out</button>
                    </>
                ) : (
                        <button className="cursor-pointer" onClick={() => signIn("google", { prompt: "select_account" })}>Sign in with Google</button>
                )}
            </div>
        </div>
    );
}