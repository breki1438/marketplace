import type {Metadata} from "next";
import CategoryList from "@/components/CategoryList";
import {prisma} from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Strona główna"
};

export default async function Home() {
    const categories = await prisma.category.findMany({
        include: {
            subcategories: {
                orderBy: { name: 'asc' }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });

  return (
      <div>
        <CategoryList categories={categories}/>
      </div>
  );
}
