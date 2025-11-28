/**
 * @jest-environment node
 */

import { GET as getListings, POST as createListing } from "@/app/api/listings/route";
import { DELETE as deleteListing, GET as getListingById } from "@/app/api/listings/[id]/route";
import { GET as getProfileListings } from "@/app/api/profile/listings/route";
import { POST as addToFav } from "@/app/api/add-to-favourite/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

jest.mock("@auth/prisma-adapter", () => ({
    PrismaAdapter: jest.fn(() => ({})),
}));

jest.mock("@/lib/prisma", () => ({
    prisma: {
        listing: {
            findMany: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn()
        },
        favourite: {
            findMany: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn()
        }
    },
}));

jest.mock("next-auth");

describe("Marketplace API Tests Suite", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Wymaganie W1: Wyszukiwanie (Search)", () => {
        it("Powinien filtrować wyniki po wpisanej frazie (Branch Coverage)", async () => {
            const req = new NextRequest("http://localhost/api/listings?search=Audi");
            (prisma.listing.findMany as jest.Mock).mockResolvedValue([]);

            await getListings(req);

            expect(prisma.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    title: { contains: "Audi", mode: "insensitive" }
                })
            }));
        });
    });

    describe("Wymaganie W4: Filtrowanie po kategorii", () => {
        it("Powinien filtrować wyniki po slugu kategorii", async () => {
            const req = new NextRequest("http://localhost/api/listings?category=motoryzacja");
            (prisma.listing.findMany as jest.Mock).mockResolvedValue([]);

            await getListings(req);

            expect(prisma.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    category: { slug: "motoryzacja" }
                })
            }));
        });
    });

    describe("Wymaganie W2: Walidacja Dodawania Ogłoszenia (POST)", () => {
        it("Powinien zwrócić błąd 400, gdy brakuje ceny", async () => {
            const body = {
                title: "Rower",
                userId: "u1",
                categoryId: "c1",
                subCategoryId: "s1"
            };
            const req = new NextRequest("http://localhost/api/listings", {
                method: "POST",
                body: JSON.stringify(body)
            });

            const res = await createListing(req);
            expect(res.status).toBe(400);
        });

        it("Powinien zwrócić kod 201 (Created), gdy dane są poprawne", async () => {
            const body = {
                title: "Rower",
                price: 100,
                userId: "u1",
                categoryId: "c1",
                subCategoryId: "s1",
                imageUrl: ""
            };
            const req = new NextRequest("http://localhost/api/listings", {
                method: "POST",
                body: JSON.stringify(body)
            });

            (prisma.listing.create as jest.Mock).mockResolvedValue({ id: 1, ...body });

            const res = await createListing(req);
            expect(res.status).toBe(201);
        });
    });

    describe("Wymaganie W3: Bezpieczeństwo Usuwania", () => {
        it("Powinien zwrócić 403 Forbidden, gdy użytkownik usuwa cudze ogłoszenie", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "haker" } });
            (prisma.listing.findUnique as jest.Mock).mockResolvedValue({ id: 1, userId: "ofiara" });

            const req = new NextRequest("http://localhost/api/listings/1", { method: "DELETE" });
            const res = await deleteListing(req, { params: Promise.resolve({ id: "1" }) });

            expect(res.status).toBe(403);
        });

        it("Powinien usunąć ogłoszenie (200 OK), gdy usuwa właściciel", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "wlasciciel" } });
            (prisma.listing.findUnique as jest.Mock).mockResolvedValue({ id: 1, userId: "wlasciciel" });

            const req = new NextRequest("http://localhost/api/listings/1", { method: "DELETE" });
            const res = await deleteListing(req, { params: Promise.resolve({ id: "1" }) });

            expect(res.status).toBe(200);
            expect(prisma.listing.delete).toHaveBeenCalled();
        });
    });

    describe("Wymaganie W6: Autoryzacja Ulubionych", () => {
        it("Powinien zwrócić 401 Unauthorized przy braku sesji", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const req = new NextRequest("http://localhost/api/add-to-favourite", {
                method: "POST",
                body: JSON.stringify({ listingId: 1 })
            });

            const res = await addToFav(req);
            expect(res.status).toBe(401);
        });
    });

    describe("Wymaganie W5: Prywatność profilu", () => {
        it("Blokada podglądu cudzych obserwowanych", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "ja" } });

            const req = new NextRequest("http://localhost/api/profile/listings?userId=on&type=obserwowane");
            const res = await getProfileListings(req);

            expect(res.status).toBe(403);
        });
    });

    describe("Wymaganie W7: Szczegóły ogłoszenia", () => {
        it("Pobranie pojedynczego ogłoszenia", async () => {
            (prisma.listing.findUnique as jest.Mock).mockResolvedValue({ id: 99, title: "Test" });

            const req = new NextRequest("http://localhost/api/listings/99");
            const res = await getListingById(req, { params: Promise.resolve({ id: "99" }) });

            const json = await res.json();
            expect(res.status).toBe(200);
            expect(json.id).toBe(99);
        });
    });

});