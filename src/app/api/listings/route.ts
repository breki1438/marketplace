import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const listings = await prisma.listing.findMany({
        include: { user: true },
    });
    return NextResponse.json(listings);
}

export async function POST(request: Request) {
    const { title, price, imageUrl, userId } = await request.json();

    const listing = await prisma.listing.create({
        data: {
            title,
            price: parseFloat(price),
            imageUrl,
            userId,
        },
    });

    return NextResponse.json(listing);
}