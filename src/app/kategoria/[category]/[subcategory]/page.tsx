import ListingList from "@/app/components/ListingList";

interface PageProps {
    params: Promise<{ category: string; subcategory: string }>;
}

export default async function SubCategoryPage({ params }: PageProps) {
    const { category, subcategory } = await params;

    return (
        <main>
            <h1 className="text-white text-3xl text-center font-bold uppercase">
                {subcategory.replace(/-/g, ' ')}
            </h1>
            {/* Pass both slugs */}
            <ListingList categorySlug={category} subcategorySlug={subcategory} />
        </main>
    );
}