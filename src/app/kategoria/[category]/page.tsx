import { prisma } from "@/lib/prisma";
import ListingList from "@/app/components/ListingList";

interface PageProps {
    params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;

    return (
        <main>
            <h1 className="text-white text-3xl text-center font-bold uppercase">
                {category.replace(/-/g, ' ')}
            </h1>
            {/* Pass only category slug */}
            <ListingList categorySlug={category} />
        </main>
    );
}