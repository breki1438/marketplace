import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json([]);
        }

        const favourites = await prisma.favourite.findMany({
            where: { userId: session.user.id },
            select: { listingId: true },
        });

        return NextResponse.json(favourites);
    } catch (error) {
        console.error("[API_USER_FAVOURITES]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}