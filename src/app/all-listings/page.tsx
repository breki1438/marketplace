import ListingList from "@/components/ListingList";
import { prisma } from "@/lib/prisma"; // Import Prisma

export default async function AllListingsPage() {
    const initialListings = await prisma.listing.findMany({
        orderBy: {
            id: 'desc'
        }
    });

    return (
        <main>
            <ListingList initialListings={initialListings} />
        </main>
    );
}