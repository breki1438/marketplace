import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function MyListingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return <p className="text-center mt-8">Musisz być zalogowany, aby zobaczyć swoje ogłoszenia.</p>;
    }

    const listings = await prisma.listing.findMany({
        where: { userId: session.user.id },
        include: { user: true },
        orderBy: { id: "desc" }
    });

    if (listings.length === 0) {
        return <p className="text-center mt-8">Nie masz jeszcze żadnych ogłoszeń.</p>;
    }

    return (
        <div className="flex flex-col items-center bg-gray-800 p-4">
            <h1 className="text-2xl font-bold mb-4">Moje ogłoszenia</h1>
            {listings.map(listing => (
                <div key={listing.id} className="bg-gray-600 p-4 m-2 rounded w-xs flex items-center gap-4">
                    {listing.imageUrl && (
                        <img
                            src={listing.imageUrl}
                            alt={listing.title}
                            width={64}
                            height={64}
                            className="rounded object-cover"
                        />
                    )}
                    <div className="flex flex-col text-left">
                        <span className="font-bold">{listing.title}</span>
                        <p>Cena: <span className="font-bold">{listing.price}zł</span></p>
                        <p>Dodane przez: {listing.user?.name ?? "Ty"}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}