import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const listingId = parseInt(id);

        if (isNaN(listingId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                category: { select: { name: true, slug: true } },
                subCategory: { select: { name: true, slug: true } },
                user: { select: { name: true, image: true, email: true } }
            }
        });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        return NextResponse.json(listing);
    } catch (error) {
        console.error("[LISTING_GET_ID]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const listingId = parseInt(id);

    if (isNaN(listingId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    try {
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { userId: true }
        });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        if (listing.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.listing.delete({
            where: { id: listingId }
        });

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("[LISTING_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const listingId = parseInt(id);

    if (isNaN(listingId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    try {
        const body = await request.json();
        const { title, price, categoryId, subCategoryId } = body;

        if (!title || !price || !categoryId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { userId: true }
        });

        if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (listing.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedListing = await prisma.listing.update({
            where: { id: listingId },
            data: {
                title,
                price: parseFloat(price),
                categoryId,
                subCategoryId
            }
        });

        return NextResponse.json(updatedListing);
    } catch (error) {
        console.error("[LISTING_PUT]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}