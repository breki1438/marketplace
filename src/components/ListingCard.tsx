import Link from "next/link";
import AddToFavourites from "./AddToFavourites";

export interface ListingItem {
    id: number;
    title: string;
    price: number;
    imageUrl: string | null;
    userId: string;
    createdAt: Date | string;
}

interface ListingCardProps {
    listing: ListingItem; // Konkretny typ zamiast 'any'
    currentUserId?: string;
    isFavourite?: boolean;
    onDelete?: (id: number) => void;
}

export default function ListingCard({ listing, currentUserId, isFavourite, onDelete }: ListingCardProps) {
    const isOwner = currentUserId && listing.userId === currentUserId;

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (!onDelete) return;

        if (confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) {
            onDelete(listing.id);
        }
    };

    const formattedPrice = new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 0
    }).format(listing.price);

    const formattedDate = new Date(listing.createdAt).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="bg-[#3A3335] p-2 w-full m-2 rounded-xl border border-[#D9D9D9] drop-shadow-xl flex gap-4 hover:bg-gray-600 transition max-w-4xl relative group">
            <Link href={`/listing/${listing.id}`} className="flex gap-4 w-full">
                {listing.imageUrl ? (
                    <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="rounded-xl drop-shadow-xl object-cover w-48 h-48 min-w-[192px]"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-48 h-48 min-w-[192px] bg-gray-600 rounded-xl flex items-center justify-center text-white text-sm">
                        Brak zdjęcia
                    </div>
                )}
                <div className="flex flex-col text-left justify-between w-full py-1">
                    <div className="flex justify-between items-start">
                        <span className="font-medium drop-shadow-xl text-2xl text-white line-clamp-2">
                            {listing.title}
                        </span>
                    </div>

                    <div className="flex justify-between items-end">
                        <p className="font-medium drop-shadow-xl text-2xl text-white">
                            {formattedPrice}
                        </p>
                        <p className="text-[#A6A6A6] text-sm">
                            Rzeszów • {formattedDate}
                        </p>
                    </div>
                </div>
            </Link>

            {isOwner ? (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                        href={`/edit-listing/${listing.id}`}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg"
                    >
                        Edytuj
                    </Link>

                    <button
                        onClick={handleDeleteClick}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg"
                    >
                        Usuń
                    </button>
                </div>
            ) : (
                currentUserId && (
                    <div className="absolute top-2 right-2 z-10">
                        <AddToFavourites
                            listingId={listing.id}
                            userId={currentUserId}
                            isFavourite={isFavourite || false}
                        />
                    </div>
                )
            )}
        </div>
    );
}