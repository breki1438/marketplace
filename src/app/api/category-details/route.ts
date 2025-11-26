import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
        return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    try {
        const category = await prisma.category.findUnique({
            where: { slug: slug },
            select: {
                id: true,
                name: true,
                slug: true,
                subcategories: {
                    orderBy: { name: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            }
        });

        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("[API_CATEGORY_DETAILS] Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}