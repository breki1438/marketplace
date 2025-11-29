import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
        const selectFields = {
            id: true,
            title: true,
            city: true,
            price: true,
            imageUrl: true,
            userId: true,
            createdAt: true,
            category: { select: { name: true } }
        };

        if (type === 'aktywne') {
            const listings = await prisma.listing.findMany({
                where: { userId: userId },
                orderBy: { id: 'desc' },
                select: selectFields
            });
            return NextResponse.json(listings);
        }

        else if (type === 'obserwowane') {
            const session = await getServerSession(authOptions);

            if (!session || session.user.id !== userId) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            const favourites = await prisma.favourite.findMany({
                where: { userId: userId },
                include: {
                    listing: {
                        select: selectFields
                    }
                },
                orderBy: { id: 'desc' }
            });

            const listings = favourites.map(fav => fav.listing);
            return NextResponse.json(listings);
        }

        return NextResponse.json([]);

    } catch (error) {
        console.error("[API_PROFILE_LISTINGS]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}