interface CategoryCardProps {
    category: string;
    onClick: (e: React.MouseEvent) => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
    return (
        <div
            onClick={onClick}
            className="flex-row items-center justify-center m-auto text-center rounded-full cursor-pointer"
        >
            <div className="bg-[#F7F4F3] w-20 h-20 rounded-full hover:bg-[#1EA6D8] transition-colors m-auto mb-3 drop-shadow-2xl">
                <img
                    src={`/images/categories/${category.toLowerCase()}.png`}
                    alt={category}
                    className="w-12 h-12 mx-auto mt-2"
                />
            </div>
            <h2 className="text-lg font-semibold text-white m-auto drop-shadow-2xl">
                {category}
            </h2>
        </div>
    );
}