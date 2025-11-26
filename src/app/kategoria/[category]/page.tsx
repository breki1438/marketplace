import ListingList from "@/components/ListingList";
import { prisma } from "@/lib/prisma";
import { notFound} from "next/navigation";

interface PageProps {
    params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;
    const categoryData = await prisma.category.findUnique({
        where: { slug: category }
    });

    if (!categoryData) {
        return notFound();
    }

    const initialListings = await prisma.listing.findMany({
        where: {
            category: {slug: category}
        },
        orderBy: { id: 'desc' }
    });

    return (
        <main>
            <ListingList categorySlug={category} categoryName={categoryData.name} initialListings={initialListings} />
        </main>
    );
}