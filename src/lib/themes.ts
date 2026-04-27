/**
 * Board background temaları.
 * Her tema bir Tailwind class string'idir (CSS-only, JIT compile edilir).
 *
 * Yeni tema eklerken: id'yi unique tut, kullanıcı seçimi localStorage'da bu id'yle saklanır.
 */
export interface Theme {
    id: string;
    name: string;
    // Board container'a uygulanacak class'lar
    className: string;
    // Tema seçici preview için (küçük thumbnail)
    previewClassName: string;
    // Kart/column ile yeterli kontrast var mı? (light theme = false)
    isDark?: boolean;
}

export const themes: Theme[] = [
    {
        id: "default",
        name: "Default",
        className: "bg-slate-50",
        previewClassName: "bg-slate-50",
    },
    {
        id: "ocean",
        name: "Ocean",
        className: "bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50",
        previewClassName: "bg-gradient-to-br from-blue-200 via-cyan-200 to-teal-200",
    },
    {
        id: "sunset",
        name: "Sunset",
        className: "bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50",
        previewClassName:
            "bg-gradient-to-br from-orange-200 via-pink-200 to-rose-200",
    },
    {
        id: "forest",
        name: "Forest",
        className: "bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50",
        previewClassName:
            "bg-gradient-to-br from-emerald-200 via-green-200 to-lime-200",
    },
    {
        id: "lavender",
        name: "Lavender",
        className: "bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50",
        previewClassName:
            "bg-gradient-to-br from-violet-200 via-purple-200 to-fuchsia-200",
    },
    {
        id: "stone",
        name: "Stone",
        className: "bg-stone-100",
        previewClassName: "bg-stone-300",
    },
    {
        id: "midnight",
        name: "Midnight",
        className: "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950",
        previewClassName:
            "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900",
        isDark: true,
    },
    {
        id: "graphite",
        name: "Graphite",
        className: "bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900",
        previewClassName:
            "bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-800",
        isDark: true,
    },
];

export const DEFAULT_THEME_ID = "default";

export function getTheme(id: string | null | undefined): Theme {
    if (!id) return themes[0];
    return themes.find((t) => t.id === id) ?? themes[0];
}