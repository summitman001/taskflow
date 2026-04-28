"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetcher";

export interface CardActivity {
    id: string;
    cardId: string;
    userId: string;
    type: string;
    metadata: {
        fromColumn?: { id: string; title: string };
        toColumn?: { id: string; title: string };
    } | null;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

export interface CardActivityResponse {
    card: {
        id: string;
        createdAt: string;
        updatedAt: string;
    };
    activities: CardActivity[];
}

export const cardActivityKey = (cardId: string) =>
    ["cardActivity", cardId] as const;

/**
 * Bir kartın aktivite geçmişini çek.
 * Sadece dialog açıldığında enabled olur — gereksiz fetch atılmaz.
 */
export function useCardActivity(cardId: string | null) {
    return useQuery({
        queryKey: cardId ? cardActivityKey(cardId) : ["cardActivity", "noop"],
        queryFn: () =>
            apiFetch<CardActivityResponse>(`/api/cards/${cardId}/activity`),
        enabled: !!cardId,
        staleTime: 0, // Her açılışta fresh çek
    });
}