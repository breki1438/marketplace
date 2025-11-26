import ListingList from "@/components/ListingList";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ category: string; subcategory: string }>;
}

export default async function SubCategoryPage({ params }: PageProps) {
    const { category, subcategory } = await params;

    const subCategoryData = await prisma.subCategory.findUnique({
        where: { slug: subcategory },
        include: {
            category: true
        }
    });

    if (!subCategoryData) {
        return notFound();
    }

    const initialListings = await prisma.listing.findMany({
        where: {
            category: { slug: category },
            subCategory: { slug: subcategory }
        },
        orderBy: { id: 'desc' }
    });

    return (
        <main>
            <ListingList
                categorySlug={category}
                subcategorySlug={subcategory}
                categoryName={subCategoryData.category.name}
                subcategoryName={subCategoryData.name}
                initialListings={initialListings}
            />
        </main>
    );
}