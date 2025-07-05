import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
    params: Promise<{ id: string }>
};

export default async function ListingPage({ params }: Props) {
    const { id } = await params;
    const numericId = Number(id);
    if (isNaN(numericId)) return notFound();

    const listing = await prisma.listing.findUnique({
        where: { id: numericId },
        include: { user: true }
    });

    if (!listing) return notFound();

    return (
        <div className="flex flex-col items-center bg-[#2C2628] p-8 min-h-screen">
            <div className="flex flex-col bg-[#3A3335] border border-[#F7F4F3] rounded p-6 w-full max-w-6xl shadow-lg">
                <div className="flex flex-row space-x-4 w-full m-auto mb-8">
                    {listing.imageUrl && (
                        <img
                            src={listing.imageUrl}
                            alt={listing.title}
                            className="rounded object-cover w-96 h-96 drop-shadow-xl"
                        />
                    )}
                    <div className="flex flex-col w-full justify-between">
                        <h1 className="text-2xl font-bold">{listing.title}</h1>
                        <div className="flex flex-row justify-between items-start">
                            <p className="text-2xl font-medium">{listing.price} zł</p>
                            <div className="rounded-xl p-4 bg-[#2E292A]">
                                <p className="font-semibold">{listing.user?.name ?? "Nieznany użytkownik"}</p>
                                <p className="font-medium text-[#A6A6A6]">{listing.user?.email ?? "Nieznany użytkownik"}</p>
                            </div>
                        </div>
                        <div className="text-sm text-[#A6A6A6]">Rzeszów - 15 maja 2025</div>
                    </div>
                </div>
                <div className="rounded-xl p-4 bg-[#2E292A]">
                    <p className="text-2xl">Opis</p>
                    <p className="p-2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod  tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim  veniam, quis nostrud exercitation ullamco laboris nisi
                        ut aliquip ex ea  commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate  velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint  occaecat cupidatat non proident, sunt in culpa qui
                        officia deserunt  mollit anim id est laborum.
                    </p>
                </div>
                <div>
                    {listing.imageUrl && (
                        <img
                            src={listing.imageUrl}
                            alt={listing.title}
                            className="rounded object-cover w-full h-full drop-shadow-xl mt-8"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}