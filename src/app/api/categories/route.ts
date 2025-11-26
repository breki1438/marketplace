import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
            }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("[API_CATEGORIES_GET] Error:", error);

        return NextResponse.json(
            { error: "Nie udało się pobrać kategorii" },
            { status: 500 }
        );
    }
}