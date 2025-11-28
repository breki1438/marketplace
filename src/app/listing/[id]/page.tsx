import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import AddToFavourites from "@/components/AddToFavourites";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) return { title: "Ogłoszenie nie znalezione" };

    const listing = await prisma.listing.findUnique({
        where: { id: numericId },
        select: { title: true, imageUrl: true }
    });

    if (!listing) return { title: "Ogłoszenie nie znalezione" };

    return {
        title: `${listing.title} | MarketPlace`,
        openGraph: {
            images: listing.imageUrl ? [listing.imageUrl] : [],
        },
    };
}

export default async function ListingPage({ params }: Props) {
    const { id } = await params;
    const numericId = parseInt(id);
    if (isNaN(numericId)) return notFound();

    const session = await getServerSession(authOptions);

    const listing = await prisma.listing.findUnique({
        where: { id: numericId },
        include: {
            user: {
                select: { id: true, name: true, email: true, image: true }
            },
            category: { select: { name: true, slug: true } },
            subCategory: { select: { name: true, slug: true } },
            favouritedBy: {
                where: { userId: session?.user?.id || "0" },
                select: { id: true }
            }
        }
    });

    if (!listing) return notFound();

    const isOwner = session?.user?.id === listing.userId;
    const isFavourite = listing.favouritedBy.length > 0;

    const formattedDate = new Date(listing.createdAt).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const formattedPrice = new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 0
    }).format(listing.price);

    return (
        <div className="flex flex-col items-center bg-[#2C2628] p-4 md:p-8 min-h-screen text-white">
            <div className="w-full max-w-6xl mb-6 text-sm text-gray-400 flex gap-2">
                <Link href="/" className="hover:text-white hover:underline">Strona główna</Link>
                <span>/</span>
                {listing.category && (
                    <>
                        <Link href={`/kategoria/${listing.category.slug}`} className="hover:text-white hover:underline">
                            {listing.category.name}
                        </Link>
                        <span>/</span>
                    </>
                )}
                {listing.subCategory && (
                    <Link href={`/kategoria/${listing.category?.slug}/${listing.subCategory.slug}`} className="hover:text-white hover:underline">
                        {listing.subCategory.name}
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#3A3335] p-4 rounded-xl border border-[#4A4345] shadow-xl">
                        {listing.imageUrl ? (
                            <img
                                src={listing.imageUrl}
                                alt={listing.title}
                                className="rounded-lg object-contain w-full max-h-[500px] bg-black/20"
                            />
                        ) : (
                            <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                                Brak zdjęcia
                            </div>
                        )}
                    </div>
                    <div className="bg-[#3A3335] p-6 rounded-xl border border-[#4A4345] shadow-xl">
                        <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">Opis</h2>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            To jest przykładowy opis, ponieważ w bazie danych jeszcze nie ma pola description.
                        </p>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-[#3A3335] p-6 rounded-xl border border-[#4A4345] shadow-xl">
                        <div className="text-sm text-gray-400 mb-2">
                            Dodano: {formattedDate}
                        </div>
                        <h1 className="text-3xl font-bold mb-2 break-words">{listing.title}</h1>
                        <p className="text-3xl font-bold text-[#1EA6D8] mb-6">{formattedPrice}</p>

                        <div className="flex flex-col gap-3">
                            {isOwner ? (
                                <Link
                                    href={`/edit-listing/${listing.id}`}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-3 rounded-lg font-bold transition-colors"
                                >
                                    Edytuj ogłoszenie
                                </Link>
                            ) : (
                                // ZMODYFIKOWANA SEKCJA ULUBIONYCH
                                session?.user?.id ? (
                                    <AddToFavourites
                                        listingId={listing.id}
                                        userId={session.user.id}
                                        isFavourite={isFavourite}
                                        withText={true}
                                        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white py-3 rounded-lg font-medium transition-colors group"
                                    />
                                ) : (
                                    <Link
                                        href="/api/auth/signin"
                                        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-center py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Zaloguj się, aby obserwować
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                    <div className="bg-[#3A3335] p-6 rounded-xl border border-[#4A4345] shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">Sprzedający</h3>
                        <div className="flex items-center gap-4">
                            {listing.user?.image ? (
                                <img
                                    src={listing.user.image}
                                    alt={listing.user.name || "User"}
                                    className="w-16 h-16 rounded-full border-2 border-gray-500"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-bold">
                                    {listing.user?.name?.[0] || "?"}
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-lg">{listing.user?.name || "Użytkownik"}</p>
                                <p className="text-sm text-gray-400">Na MarketPlace od 2025</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-600">
                            <p className="text-sm text-gray-400">Email kontaktowy:</p>
                            <p className="font-medium">{listing.user?.email || "Ukryty"}</p>
                        </div>
                    </div>
                    <div className="bg-[#3A3335] p-6 rounded-xl border border-[#4A4345] shadow-xl">
                        <h3 className="text-lg font-semibold mb-2">Lokalizacja</h3>
                        <p className="text-gray-300 mb-4">Rzeszów, Podkarpackie</p>
                    </div>
                </div>
            </div>
        </div>
    );
}