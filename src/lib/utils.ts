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

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 0
    }).format(price);
};

export const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};