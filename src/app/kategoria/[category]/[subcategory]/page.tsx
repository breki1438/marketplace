import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ListingList from "@/components/ListingList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Props = {
    params: Promise<{ category: string; subcategory: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { subcategory } = await params;
    const subData = await prisma.subCategory.findUnique({
        where: { slug: subcategory },
        select: { name: true, category: { select: { name: true } } }
    });

    if (!subData) return { title: "Podkategoria niedostępna" };

    return {
        title: `${subData.name} - ${subData.category.name} | MarketPlace`,
    };
}

export default async function SubCategoryPage({ params }: Props) {
    const { category, subcategory } = await params;
    const session = await getServerSession(authOptions);

    const subCategoryData = await prisma.subCategory.findUnique({
        where: { slug: subcategory },
        select: {
            id: true,
            name: true,
            category: {
                select: { name: true }
            }
        }
    });

    if (!subCategoryData) {
        return notFound();
    }

    const rawListings = await prisma.listing.findMany({
        where: {
            category: { slug: category },
            subCategory: { slug: subcategory }
        },
        orderBy: { id: 'desc' },
        select: {
            id: true,
            title: true,
            city: true,
            price: true,
            imageUrl: true,
            userId: true,
            createdAt: true
        }
    });

    let initialFavouriteIds: number[] = [];
    if (session?.user?.id) {
        const favourites = await prisma.favourite.findMany({
            where: { userId: session.user.id },
            select: { listingId: true }
        });
        initialFavouriteIds = favourites.map(f => f.listingId);
    }

    const initialListings = rawListings.map(listing => ({
        ...listing,
        createdAt: listing.createdAt.toISOString()
    }));

    return (
        <main>
            <ListingList
                categorySlug={category}
                subcategorySlug={subcategory}
                categoryName={subCategoryData.category.name}
                subcategoryName={subCategoryData.name}
                initialListings={initialListings}
                initialFavouriteIds={initialFavouriteIds}
            />
        </main>
    );
}