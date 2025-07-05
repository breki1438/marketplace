// src/app/api/user-favourites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Brak userId." }, { status: 400 });
    }

    const favourites = await prisma.favourite.findMany({
        where: { userId },
        select: { listingId: true },
    });

    return NextResponse.json(favourites);
}