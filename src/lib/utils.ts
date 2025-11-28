const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const getCategoryIconUrl = (iconName: string | null) => {
    if (!iconName) {
        return "/images/placeholder-category.png";
    }

    if (iconName.startsWith("http")) {
        return iconName;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/images/categories/${iconName}`;
};