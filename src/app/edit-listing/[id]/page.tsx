"use client";

import { useState, useEffect, ChangeEvent, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Category { id: string; name: string; slug: string; }
interface SubCategory { id: string; name: string; slug: string; }

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");

    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function initData() {
            try {
                const catRes = await fetch("/api/categories");
                const cats = await catRes.json();
                setCategories(cats);

                const listingRes = await fetch(`/api/listings?id=${id}`);
                const listingDataRes = await fetch(`/api/listings/${id}`);
                const listing = await listingDataRes.json();

                if (listing) {
                    setTitle(listing.title);
                    setPrice(listing.price.toString());
                    setSelectedCategoryId(listing.categoryId);

                    const selectedCat = cats.find((c: Category) => c.id === listing.categoryId);
                    if (selectedCat) {
                        const subRes = await fetch(`/api/category-details?slug=${selectedCat.slug}`);
                        const subData = await subRes.json();
                        setSubcategories(subData.subcategories || []);
                        setSelectedSubCategoryId(listing.subCategoryId);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
        initData();
    }, [id]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch(`/api/listings/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                price,
                categoryId: selectedCategoryId,
                subCategoryId: selectedSubCategoryId
            })
        });

        if (res.ok) {
            router.push("/moje-konto");
            router.refresh();
        } else {
            alert("Błąd edycji");
        }
    };

    if (isLoading) return <div className="text-white text-center mt-10">Ładowanie...</div>;

    return (
        <form onSubmit={handleUpdate} className="flex flex-col gap-4 bg-[#3A3335] p-6 rounded-xl m-auto w-full max-w-lg shadow-lg text-white mt-10">
            <h1 className="text-2xl font-bold mb-4 text-center">Edytuj ogłoszenie</h1>

            <label>Tytuł</label>
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="p-2 rounded bg-[#2C2628] border border-gray-600"
            />

            <label>Cena</label>
            <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="p-2 rounded bg-[#2C2628] border border-gray-600"
            />

            <label>Kategoria</label>
            <select
                value={selectedCategoryId}
                onChange={(e) => alert("Zmiana kategorii wymaga przeładowania podkategorii (logika z AddListingForm)")}
                className="p-2 rounded bg-[#2C2628] border border-gray-600"
                disabled
            >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <button type="submit" className="bg-green-600 p-2 rounded mt-4 font-bold">Zapisz zmiany</button>
        </form>
    );
}