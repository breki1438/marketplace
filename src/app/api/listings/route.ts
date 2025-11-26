import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const subCategorySlug = searchParams.get("subcategory");
    const searchQuery = searchParams.get("search");
    const idParam = searchParams.get("id");

    try {
        if (idParam) {
            const listing = await prisma.listing.findUnique({
                where: { id: parseInt(idParam) },
                include: { category: true, subCategory: true }
            });
            return NextResponse.json(listing);
        }

        const whereClause: any = {};

        if (categorySlug && categorySlug !== "undefined") {
            whereClause.category = { slug: categorySlug };
        }

        if (subCategorySlug && subCategorySlug !== "undefined") {
            whereClause.subCategory = { slug: subCategorySlug };
        }

        if (searchQuery) {
            whereClause.title = {
                contains: searchQuery,
                mode: 'insensitive'
            };
        }

        const listings = await prisma.listing.findMany({
            where: whereClause,
            orderBy: { id: 'desc' },
            select: {
                id: true,
                title: true,
                price: true,
                imageUrl: true,
                userId: true,
                createdAt: true,
                // Relacje:
                category: {
                    select: { name: true, slug: true }
                },
                subCategory: {
                    select: { name: true, slug: true }
                },
                user: {
                    select: { name: true, image: true } // Przyda się, by pokazać kto sprzedaje
                }
            }
        });

        return NextResponse.json(listings);
    } catch (error) {
        console.error("[API_LISTINGS_GET] Error:", error);
        return NextResponse.json({ error: "Error fetching listings" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, price, imageUrl, userId, categoryId, subCategoryId } = body;

        if (!title || !price || !userId || !categoryId || !subCategoryId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newListing = await prisma.listing.create({
            data: {
                title,
                price: parseFloat(price),
                imageUrl,
                userId,
                categoryId,
                subCategoryId
            }
        });

        return NextResponse.json(newListing, { status: 201 });
    } catch (error) {
        console.error("[API_LISTINGS_POST] Error:", error);
        return NextResponse.json({ error: "Error creating listing" }, { status: 500 });
    }
}