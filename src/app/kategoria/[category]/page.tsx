import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ListingList from "@/components/ListingList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Props = {
    params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { category } = await params;
    const categoryData = await prisma.category.findUnique({
        where: { slug: category },
        select: { name: true }
    });

    return {
        title: categoryData ? `${categoryData.name} | MarketPlace` : "Kategoria niedostępna",
    };
}

export default async function CategoryPage({ params }: Props) {
    const { category } = await params;
    const session = await getServerSession(authOptions);

    const categoryData = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true, name: true }
    });

    if (!categoryData) {
        return notFound();
    }

    const rawListings = await prisma.listing.findMany({
        where: { category: { slug: category } },
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
                categoryName={categoryData.name}
                initialListings={initialListings}
                initialFavouriteIds={initialFavouriteIds}
            />
        </main>
    );
}