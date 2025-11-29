/**
 * @jest-environment node
 */

import { GET as getListings, POST as createListing } from "@/app/api/listings/route";
import { DELETE as deleteListing, GET as getListingById, PUT as updateListing } from "@/app/api/listings/[id]/route";
import { GET as getProfileListings } from "@/app/api/profile/listings/route";
import { POST as addToFav, DELETE as removeFromFav } from "@/app/api/add-to-favourite/route";
import { GET as getUserFavs } from "@/app/api/user-favourites/route"; // Dodajemy test endpointu usera
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

// --- MOCKI ---
jest.mock("@auth/prisma-adapter", () => ({
    PrismaAdapter: jest.fn(() => ({})),
}));

jest.mock("@/lib/prisma", () => ({
    prisma: {
        listing: {
            findMany: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            update: jest.fn()
        },
        favourite: {
            findMany: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn()
        }
    },
}));

jest.mock("next-auth");

describe("Marketplace API - Ultimate Test Suite (100% Coverage Goal)", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =================================================================
    // 1. LISTINGS API (Szukanie, Dodawanie, Filtrowanie)
    // =================================================================
    describe("API: Listings (Główne)", () => {

        it("W1: Powinien filtrować wyniki po wpisanej frazie (Search)", async () => {
            const req = new NextRequest("http://localhost/api/listings?search=Audi");
            (prisma.listing.findMany as jest.Mock).mockResolvedValue([]);
            await getListings(req);
            expect(prisma.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ title: { contains: "Audi", mode: "insensitive" } })
            }));
        });

        it("W4: Powinien filtrować wyniki po slugu kategorii", async () => {
            const req = new NextRequest("http://localhost/api/listings?category=motoryzacja");
            await getListings(req);
            expect(prisma.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ category: { slug: "motoryzacja" } })
            }));
        });

        it("Powinien obsłużyć pobranie pojedynczego ogłoszenia przez ?id=", async () => {
            const req = new NextRequest("http://localhost/api/listings?id=123");
            (prisma.listing.findUnique as jest.Mock).mockResolvedValue({ id: 123 });
            const res = await getListings(req);
            const json = await res.json();
            expect(res.status).toBe(200);
            expect(json.id).toBe(123);
        });

        it("W2: Walidacja POST - Błąd 400 gdy brakuje pól", async () => {
            const body = { title: "Rower" }; // Brak reszty
            const req = new NextRequest("http://localhost/api/listings", { method: "POST", body: JSON.stringify(body) });
            const res = await createListing(req);
            expect(res.status).toBe(400);
        });

        it("W2: Sukces POST - Kod 201 gdy dane poprawne", async () => {
            const body = { title: "Rower", description: "Opis", city: "Wwa", price: 100, userId: "u1", categoryId: "c1", subCategoryId: "s1" };
            const req = new NextRequest("http://localhost/api/listings", { method: "POST", body: JSON.stringify(body) });
            (prisma.listing.create as jest.Mock).mockResolvedValue({ id: 1, ...body });
            const res = await createListing(req);
            expect(res.status).toBe(201);
        });

        it("Obsługa błędu bazy danych w GET (500)", async () => {
            const req = new NextRequest("http://localhost/api/listings");
            (prisma.listing.findMany as jest.Mock).mockRejectedValue(new Error("DB Error"));
            const res = await getListings(req);
            expect(res.status).toBe(500);
        });
    });

    // =================================================================
    // 2. LISTING DETAILS API (Pobieranie, Usuwanie, Edycja)
    // =================================================================
    describe("API: Listing Details [id]", () => {

        // GET
        it("W7: Pobranie szczegółów (GET) - Sukces 200", async () => {
            (prisma.listing.findUnique as jest.Mock).mockResolvedValue({ id: 99, title: "Test" });
            const req = new NextRequest("http://localhost/api/listings/99");
            const res = await getListingById(req, { params: Promise.resolve({ id: "99" }) });
            expect(res.status).toBe(200);
        });

        it("GET - Błąd 400 dla niepoprawnego ID (np. 'abc')", async () => {
            const req = new NextRequest("http://localhost/api/listings/abc");
            const res = await getListingById(req, { params: Promise.resolve({ id: "abc" }) });
            expect(res.status).toBe(400);
        });

        it("GET - Błąd 404 gdy nie znaleziono", async () => {
            (prisma.listing.findUnique as jest.Mock).mockResolvedValue(null);
            const req = new NextRequest("http://localhost/api/listings/999");
            const res = await getListingById(req, { params: Promise.resolve({ id: "999" }) });
            expect(res.status).toBe(404);
        });

        // DELETE
        it("W3: DELETE - 403 gdy usuwa haker", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "haker" } });
            (prisma.listing.findUnique as jest.Mock).mockResolvedValue({ id: 1, userId: "wlasciciel" });
            const req = new NextRequest("http://localhost/api/listings/1", { method: "DELETE" });
            const res = await deleteListing(req, { params: Promise.resolve({ id: "1" }) });
            expect(res.status).toBe(403);
        });

        it("DELETE - 200 gdy usuwa właściciel", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "ja" } });
            (prisma.listing.findUnique as jest.Mock).mockResolvedValue({ id: 1, userId: "ja" });
            const req = new NextRequest("http://localhost/api/listings/1", { method: "DELETE" });
            const res = await deleteListing(req, { params: Promise.resolve({ id: "1" }) });
            expect(res.status).toBe(200);
        });

        // PUT (EDYCJA) - Nowe testy dla coverage!
        it("PUT - Edycja ogłoszenia (Sukces 200)", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "ja" } });
            (prisma.listing.findUnique as jest.Mock).mockResolvedValue({ id: 1, userId: "ja" });

            // POPRAWKA: Dodano description i city, bo są wymagane w API
            const body = {
                title: "Zmiana",
                description: "Nowy opis",
                city: "Gdańsk",
                price: 200,
                categoryId: "c2",
                subCategoryId: "s2"
            };
            const req = new NextRequest("http://localhost/api/listings/1", { method: "PUT", body: JSON.stringify(body) });

            // Mockujemy sukces update'a
            (prisma.listing.update as jest.Mock).mockResolvedValue({ id: 1, ...body });

            const res = await updateListing(req, { params: Promise.resolve({ id: "1" }) });
            expect(res.status).toBe(200);
        });

        it("PUT - Błąd 400 przy braku pól", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "ja" } });
            const req = new NextRequest("http://localhost/api/listings/1", { method: "PUT", body: JSON.stringify({}) }); // Puste body
            const res = await updateListing(req, { params: Promise.resolve({ id: "1" }) });
            expect(res.status).toBe(400);
        });
    });

    // =================================================================
    // 3. FAVOURITES API (Dodawanie, Usuwanie, Lista)
    // =================================================================
    describe("API: Favourites", () => {

        it("W6: POST - 401 Unauthorized bez sesji", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);
            const req = new NextRequest("http://localhost/api/add-to-favourite", { method: "POST", body: JSON.stringify({ listingId: 1 }) });
            const res = await addToFav(req);
            expect(res.status).toBe(401);
        });

        it("POST - 201 Created (Dodanie do ulubionych)", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "ja" } });

            const req = new NextRequest("http://localhost/api/add-to-favourite", {
                method: "POST",
                body: JSON.stringify({ listingId: 1 })
            });

            // POPRAWKA: Jawnie mockujemy sukces create
            (prisma.favourite.create as jest.Mock).mockResolvedValue({ id: 100, userId: "ja", listingId: 1 });

            const res = await addToFav(req);
            expect(res.status).toBe(201);
        });

        it("DELETE - 200 OK (Usunięcie z ulubionych)", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "ja" } });
            const req = new NextRequest("http://localhost/api/add-to-favourite", { method: "DELETE", body: JSON.stringify({ listingId: 1 }) });
            const res = await removeFromFav(req);
            expect(res.status).toBe(200);
        });

        it("GET User Favourites - Zwraca listę ID", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "ja" } });
            (prisma.favourite.findMany as jest.Mock).mockResolvedValue([{ listingId: 10 }, { listingId: 20 }]);

            const res = await getUserFavs();
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json).toHaveLength(2);
        });
    });

    // =================================================================
    // 4. PROFILE API
    // =================================================================
    describe("API: Profile Listings", () => {

        it("GET 'aktywne' - zwraca ogłoszenia usera", async () => {
            const req = new NextRequest("http://localhost/api/profile/listings?userId=user1&type=aktywne");
            (prisma.listing.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
            const res = await getProfileListings(req);
            const json = await res.json();
            expect(json).toHaveLength(1);
        });

        it("W5: GET 'obserwowane' - 403 gdy pytamy o cudze", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "ja" } });
            const req = new NextRequest("http://localhost/api/profile/listings?userId=ktos_inny&type=obserwowane");
            const res = await getProfileListings(req);
            expect(res.status).toBe(403);
        });

        it("GET 'obserwowane' - 200 gdy pytamy o swoje", async () => {
            (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "ja" } });
            const req = new NextRequest("http://localhost/api/profile/listings?userId=ja&type=obserwowane");
            (prisma.favourite.findMany as jest.Mock).mockResolvedValue([{ listing: { id: 5 } }]);

            const res = await getProfileListings(req);
            const json = await res.json();
            expect(res.status).toBe(200);
            expect(json[0].id).toBe(5);
        });
    });

});