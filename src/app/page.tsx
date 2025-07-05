import Image from "next/image";
import type {Metadata} from "next";
import CategoryList from "@/app/components/CategoryList";

export const metadata: Metadata = {
  title: "Strona główna"
};

export default function Home() {
  return (
      <div>
        <CategoryList />
      </div>
  );
}
