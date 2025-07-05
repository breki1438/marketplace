"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { uploadImage } from "@/supabase/storage/client";

export default function AddListingForm() {
    const { data: session, status } = useSession();
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsUploading(true);
        let imageUrl = "";

        if (imageFile) {
            const { imageUrl: url, error } = await uploadImage({
                file: imageFile,
                bucket: "images"
            });
            if (error || !url) {
                setMessage("Błąd podczas przesyłania obrazu.");
                setIsUploading(false);
                return;
            }
            imageUrl = url;
        } else {
            setMessage("Wybierz obraz.");
            setIsUploading(false);
            return;
        }

        if (!session?.user?.id) {
            setMessage("Brak użytkownika.");
            setIsUploading(false);
            return;
        }

        const res = await fetch("/api/listings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, price, imageUrl, userId: session.user.id }),
        });

        if (res.ok) {
            setMessage("Ogłoszenie dodane!");
            setTitle("");
            setPrice("");
            setImageFile(null);
        } else {
            setMessage("Błąd podczas dodawania ogłoszenia.");
        }
        setIsUploading(false);
    }

    if (status === "loading") return <p>Ładowanie...</p>;
    if (!session) return <p>Musisz być zalogowany, aby dodać ogłoszenie.</p>;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-gray-600 m-auto w-1/2">
            <input
                type="text"
                placeholder="Tytuł"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="p-2 rounded"
            />
            <input
                type="number"
                placeholder="Cena"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                className="p-2 rounded"
            />
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="p-2 rounded"
                required
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded" disabled={isUploading}>
                {isUploading ? "Przesyłanie..." : "Dodaj ogłoszenie"}
            </button>
            {message && <p>{message}</p>}
        </form>
    );
}