import ListingList from "@/components/ListingList";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function AllListingsPage() {
    const session = await getServerSession(authOptions);

    const rawListings = await prisma.listing.findMany({
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
                initialListings={initialListings}
                initialFavouriteIds={initialFavouriteIds}
            />
        </main>
    );
}