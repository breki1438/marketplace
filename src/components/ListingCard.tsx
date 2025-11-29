import Link from "next/link";
import AddToFavourites from "./AddToFavourites";

export interface ListingItem {
    id: number;
    title: string;
    city: string;
    price: number;
    imageUrl: string | null;
    userId: string;
    createdAt: Date | string;
}

interface ListingCardProps {
    listing: ListingItem;
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
        <div className="group relative w-full bg-[#3A3335] border border-white/5 rounded-xl shadow-md hover:shadow-xl hover:border-white/10 transition-all duration-300 overflow-hidden">
            <Link href={`/listing/${listing.id}`} className="flex p-3 gap-3 sm:gap-5 w-full">

                <div className="relative w-32 h-32 sm:w-48 sm:h-40 flex-shrink-0 rounded-lg overflow-hidden bg-[#2C2628]">
                    {listing.imageUrl ? (
                        <img
                            src={listing.imageUrl}
                            alt={listing.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs sm:text-sm">
                            Brak zdjęcia
                        </div>
                    )}
                </div>

                <div className="flex flex-col justify-between flex-grow py-1">
                    <div className="pr-8">
                        <h3 className="text-white font-semibold text-lg sm:text-xl line-clamp-2 leading-tight group-hover:text-[#1EA6D8] transition-colors">
                            {listing.title}
                        </h3>
                    </div>

                    <div className="flex flex-col gap-1">
                        <p className="text-[#1EA6D8] font-bold text-lg sm:text-2xl">
                            {formattedPrice}
                        </p>
                        <div className="flex items-center text-[#A6A6A6] text-xs sm:text-sm gap-2">
                            <span>{listing.city}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </div>
            </Link>

            {isOwner ? (
                <div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-20">
                    <Link
                        href={`/edit-listing/${listing.id}`}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-lg transition-colors backdrop-blur-sm"
                    >
                        Edytuj
                    </Link>
                    <button
                        onClick={handleDeleteClick}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-lg transition-colors backdrop-blur-sm"
                    >
                        Usuń
                    </button>
                </div>
            ) : (
                currentUserId && (
                    <div className="absolute top-3 right-3 z-20">
                        <div className="bg-[#2C2628]/50 backdrop-blur-sm w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#2C2628] transition-colors shadow-sm cursor-pointer">
                            <AddToFavourites
                                listingId={listing.id}
                                userId={currentUserId}
                                isFavourite={isFavourite || false}
                            />
                        </div>
                    </div>
                )
            )}
        </div>
    );
}