export const createSlug = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/ł/g, 'l')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};