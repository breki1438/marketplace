import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const subCategorySlug = searchParams.get("subcategory");
    const searchQuery = searchParams.get("search"); // 1. Get search param

    const whereClause: any = {};

    if (categorySlug) {
        whereClause.category = { slug: categorySlug };
    }

    if (subCategorySlug) {
        whereClause.subCategory = { slug: subCategorySlug };
    }

    // 2. Add Search Logic
    if (searchQuery) {
        whereClause.title = {
            contains: searchQuery,
            mode: 'insensitive' // Case-insensitive search (Postgres specific)
        };
    }

    try {
        const listings = await prisma.listing.findMany({
            where: whereClause,
            orderBy: { id: 'desc' }
        });
        return NextResponse.json(listings);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching listings" }, { status: 500 });
    }
}