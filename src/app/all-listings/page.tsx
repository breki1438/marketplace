import ListingList from "@/app/components/ListingList";

export default function AllListingsPage() {
    return (
        <main>
            <h1 className="text-white text-3xl text-center font-bold">Wszystkie ogłoszenia</h1>
            {/* No props passed, so it fetches everything */}
            <ListingList />
        </main>
    );
}