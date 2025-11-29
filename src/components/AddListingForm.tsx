"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { uploadImage } from "@/supabase/storage/client";
import { useCategories } from "@/hooks/useCategories";

export default function AddListingForm() {
    const { data: session, status } = useSession();

    const { categories, subcategories, fetchSubcategoriesForCategory } = useCategories();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [city, setCity] = useState("");
    const [price, setPrice] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

    const [message, setMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const catId = e.target.value;
        setSelectedCategoryId(catId);
        setSelectedSubCategoryId("");
        fetchSubcategoriesForCategory(catId);
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) return;

        setIsUploading(true);
        setMessage("");

        if (!selectedCategoryId || !selectedSubCategoryId || !city || !description) {
            setMessage("Wypełnij wszystkie wymagane pola.");
            setIsUploading(false);
            return;
        }
        if (!imageFile) {
            setMessage("Wybierz obraz.");
            setIsUploading(false);
            return;
        }

        try {
            const { imageUrl, error } = await uploadImage({
                file: imageFile,
                bucket: "images"
            });

            if (error || !imageUrl) throw new Error("Błąd przesyłania zdjęcia");

            const res = await fetch("/api/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    city,
                    price: parseFloat(price),
                    imageUrl,
                    userId: session.user.id,
                    categoryId: selectedCategoryId,
                    subCategoryId: selectedSubCategoryId
                }),
            });

            if (!res.ok) throw new Error("Błąd API");

            setMessage("Ogłoszenie dodane!");
            setTitle("");
            setDescription("");
            setCity("");
            setPrice("");
            setImageFile(null);
            setSelectedCategoryId("");
            setSelectedSubCategoryId("");

        } catch (error) {
            console.error(error);
            setMessage("Wystąpił błąd podczas dodawania ogłoszenia.");
        } finally {
            setIsUploading(false);
        }
    };

    if (status === "loading") return <p className="text-white text-center">Ładowanie...</p>;
    if (!session) return <p className="text-white text-center">Musisz być zalogowany.</p>;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#3A3335] p-6 rounded-xl m-auto w-full max-w-lg shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-2 text-center">Dodaj ogłoszenie</h2>

            <input
                type="text"
                placeholder="Tytuł ogłoszenia"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="p-3 rounded bg-[#2C2628] border border-gray-600 focus:border-blue-500 outline-none"
            />

            <textarea
                placeholder="Opis przedmiotu"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={4}
                className="p-3 rounded bg-[#2C2628] border border-gray-600 focus:border-blue-500 outline-none resize-none"
            />

            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Miasto"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    className="p-3 w-1/2 rounded bg-[#2C2628] border border-gray-600 focus:border-blue-500 outline-none"
                />
                <input
                    type="number"
                    placeholder="Cena (PLN)"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                    className="p-3 w-1/2 rounded bg-[#2C2628] border border-gray-600 focus:border-blue-500 outline-none"
                />
            </div>

            <div className="flex flex-col gap-2">
                <select
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    required
                    className="p-3 rounded bg-[#2C2628] border border-gray-600 focus:border-blue-500 outline-none"
                >
                    <option value="">-- Wybierz kategorię --</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select
                    value={selectedSubCategoryId}
                    onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                    required
                    disabled={!selectedCategoryId}
                    className="p-3 rounded bg-[#2C2628] border border-gray-600 focus:border-blue-500 outline-none disabled:opacity-50"
                >
                    <option value="">-- Wybierz podkategorię --</option>
                    {subcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300">Zdjęcie przedmiotu:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="p-2 rounded bg-[#2C2628] border border-gray-600"
                    required
                />
            </div>

            <button
                type="submit"
                className="bg-[#1EA6D8] hover:bg-[#1593bf] text-white font-bold p-3 rounded mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
            >
                {isUploading ? "Przesyłanie..." : "Dodaj ogłoszenie"}
            </button>

            {message && (
                <p className={`text-center font-semibold mt-2 ${message === "Ogłoszenie dodane!" ? "text-green-400" : "text-red-400"}`}>
                    {message}
                </p>
            )}
        </form>
    );
}