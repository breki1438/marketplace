import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Upewnij się, że ścieżka jest poprawna

export async function POST(req: NextRequest) {
    try {
        // 1. Weryfikacja sesji (Security)
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
        }

        // 2. Pobranie danych (tylko listingId, userId mamy z sesji)
        const body = await req.json();
        const listingId = parseInt(body.listingId); // Zabezpieczenie typu

        if (isNaN(listingId)) {
            return NextResponse.json({ error: 'Nieprawidłowe ID ogłoszenia' }, { status: 400 });
        }

        // 3. Zapis do bazy
        // Używamy create, ale w bloku try-catch na wypadek duplikatu
        const favourite = await prisma.favourite.create({
            data: {
                userId: session.user.id,
                listingId: listingId
            },
        });

        return NextResponse.json(favourite, { status: 201 });

    } catch (error: any) {
        // Obsługa błędu unikalności (P2002 w Prismie)
        // Jeśli rekord już istnieje, traktujemy to jako sukces (idempotentność)
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Już dodano do ulubionych' }, { status: 200 });
        }

        console.error("Błąd dodawania do ulubionych:", error);
        return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
        }

        const body = await req.json();
        const listingId = parseInt(body.listingId);

        if (isNaN(listingId)) {
            return NextResponse.json({ error: 'Nieprawidłowe ID ogłoszenia' }, { status: 400 });
        }

        await prisma.favourite.deleteMany({
            where: {
                userId: session.user.id,
                listingId: listingId
            },
        });

        return NextResponse.json({ message: 'Usunięto z ulubionych.' }, { status: 200 });

    } catch (error) {
        console.error("Błąd usuwania z ulubionych:", error);
        return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
    }
}