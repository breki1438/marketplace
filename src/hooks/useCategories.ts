import { useState, useEffect } from "react";
import { Category, SubCategory } from "@/types";

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Błąd pobierania kategorii:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCategories();
    }, []);

    const fetchSubcategoriesForCategory = async (categoryId: string) => {
        setSubcategories([]);
        if (!categoryId) return;

        const selectedCat = categories.find((c) => c.id === categoryId);
        if (!selectedCat) return;

        try {
            const res = await fetch(`/api/category-details?slug=${selectedCat.slug}`);
            if (res.ok) {
                const data = await res.json();
                setSubcategories(data.subcategories || []);
            }
        } catch (error) {
            console.error("Błąd pobierania podkategorii:", error);
        }
    };

    return {
        categories,
        subcategories,
        isLoading,
        fetchSubcategoriesForCategory,
    };
}