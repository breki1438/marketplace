import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, price } = await req.json();

    if (!title || !price) {
        return NextResponse.json({ error: "Brak wymaganych pól" }, { status: 400 });
    }

    if (!session?.user?.email) {
        return NextResponse.json({ error: "User email not found in session" }, { status: 400 });
    }

    const prismaUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!prismaUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const listing = await prisma.listing.create({
        data: {
            title,
            price: Number(price),
            userId: prismaUser.id,
        },
    });

    return NextResponse.json(listing, { status: 201 });
}