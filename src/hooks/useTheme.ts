"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME_ID, getTheme, type Theme } from "@/lib/themes";

/**
 * Bir board için tema yönetimi (localStorage'da kalıcı).
 *
 * - Server'da render olurken null döner (hydration güvenli)
 * - Client'a geçince localStorage'dan okur
 * - setTheme ile değiştirir, anında localStorage'a yazar
 *
 * Key formatı: theme:[boardId]
 */
export function useBoardTheme(boardId: string) {
    const [themeId, setThemeId] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    // İlk client render'da localStorage'dan oku
    useEffect(() => {
        const stored = localStorage.getItem(`theme:${boardId}`);
        setThemeId(stored ?? DEFAULT_THEME_ID);
        setIsHydrated(true);
    }, [boardId]);

    const setTheme = (newThemeId: string) => {
        setThemeId(newThemeId);
        try {
            localStorage.setItem(`theme:${boardId}`, newThemeId);
        } catch {
            // localStorage disabled (private mode) — hata yutma, in-memory devam
        }
    };

    // İlk render: server-safe default
    // Sonraki render'lar: gerçek tema
    const theme: Theme = isHydrated ? getTheme(themeId) : getTheme(null);

    return { theme, setTheme, isHydrated };
}