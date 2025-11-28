export async function convertBlobUrlToFile(blobUrl: string) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const fileName = Math.random().toString(36).slice(2, 9);
    const mimeType = blob.type || "application/octet-stream";
    const extension = mimeType.includes('/') ? mimeType.split('/')[1] : 'bin';
    const file = new File([blob], `${fileName}.${extension}`, { type: mimeType });
    return file;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const getCategoryIconUrl = (iconName: string | null) => {
    if (!iconName) {
        return "/images/placeholder-category.png";
    }

    if (iconName.startsWith("http")) {
        return iconName;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/images/categories/${iconName}`;
};