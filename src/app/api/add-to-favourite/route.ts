import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId, listingId } = await req.json();

        if (!userId || !listingId) {
            return NextResponse.json({ error: 'Brak wymaganych danych.' }, { status: 400 });
        }

        const favourite = await prisma.favourite.create({
            data: { userId, listingId },
        });

        return NextResponse.json(favourite, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { userId, listingId } = await req.json();

        if (!userId || !listingId) {
            return NextResponse.json({ error: 'Brak wymaganych danych.' }, { status: 400 });
        }

        await prisma.favourite.deleteMany({
            where: { userId, listingId },
        });

        return NextResponse.json({ message: 'Usunięto z ulubionych.' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
    }
}