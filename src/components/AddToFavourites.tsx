"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    listingId: number;
    userId: string;
    isFavourite: boolean;
};

function HeartIcon({ filled }: { filled: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-6 h-6 transition-all duration-300 hover:scale-110 ${
                filled ? "fill-white" : "fill-transparent"
            }`}
        >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
    );
}

export default function AddToFavourites({ listingId, userId, isFavourite: initialIsFavourite }: Props) {
    const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleToggleFavourite(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();

        if (isLoading) return;

        const previousState = isFavourite;
        setIsFavourite(!previousState);
        setIsLoading(true);

        try {
            const method = !previousState ? "POST" : "DELETE";

            const res = await fetch("/api/add-to-favourite", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId }),
            });

            if (!res.ok) {
                throw new Error("Błąd API");
            }

            router.refresh();

        } catch (error) {
            console.error("Błąd dodawania do ulubionych:", error);
            setIsFavourite(previousState);
            alert("Nie udało się zaktualizować ulubionych. Spróbuj ponownie.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <button
            onClick={handleToggleFavourite}
            disabled={isLoading}
            className="cursor-pointer focus:outline-none disabled:opacity-50 transition-opacity"
            aria-label={isFavourite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
            title={isFavourite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
        >
            <HeartIcon filled={isFavourite} />
        </button>
    );
}