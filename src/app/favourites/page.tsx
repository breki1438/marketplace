import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function FavouritesPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center p-4 bg-gray-900 h-screen">
                <h1 className="text-2xl font-bold mb-4">Ulubione</h1>
                <p className="text-white">Musisz być zalogowany, aby zobaczyć ulubione.</p>
            </div>
        );
    }

    const favourites = await prisma.favourite.findMany({
        where: { userId: session.user.id },
        include: { listing: true },
    });

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-900 h-screen">
            <h1 className="text-2xl font-bold mb-4">Ulubione</h1>
            {favourites.length === 0 ? (
                <p className="text-white">Brak ulubionych przedmiotów.</p>
            ) : (
                <ul>
                    {favourites.map(fav => (
                        <li key={fav.id} className="text-white mb-2">
                            {fav.listing?.title} - {fav.listing?.price}zł
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}