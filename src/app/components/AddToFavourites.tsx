"use client";

import { useState } from "react";

type Props = {
    listingId: number;
    userId: string;
    isFavourite: boolean;
};

export default function AddToFavourites({ listingId, userId, isFavourite: initialIsFavourite }: Props) {
    const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleToggleFavourite(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();

        if (loading) return;
        setLoading(true);

        try {
            const method = isFavourite ? "DELETE" : "POST";
            const res = await fetch("/api/add-to-favourite", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId, userId }),
            });
            if (res.ok) {
                setIsFavourite(!isFavourite);
            } else {
                setMessage("Wystąpił błąd.");
            }
        } catch {
            setMessage("Wystąpił błąd sieci.");
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(""), 2000);
        }
    }

    return (
        <div
            onClick={handleToggleFavourite}
            style={{ cursor: loading ? "not-allowed" : "pointer", display: "inline-block" }}
        >
            {isFavourite ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 hover:scale-110 transition-transform"
                    style={{ transition: "fill 0.3s ease" }}
                >
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 hover:scale-110 transition-transform"
                    style={{ transition: "fill 0.3s ease" }}
                >
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
            )}
            {message && <span style={{ marginLeft: 8, color: "white" }}>{message}</span>}
        </div>
    );
}
