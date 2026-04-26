"use client";

import { useUIStore } from "@/stores/useUIStore";
import type { Card as CardType } from "@/types";

interface Props {
    card: CardType;
}

export function Card({ card }: Props) {
    const setEditingCardId = useUIStore((s) => s.setEditingCardId);

    return (
        <button
            type="button"
            onClick={() => setEditingCardId(card.id)}
            className="block w-full rounded-md border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-slate-300 hover:shadow"
        >
            <p className="text-sm font-medium text-slate-900">{card.title}</p>
            {card.description && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {card.description}
                </p>
            )}
        </button>
    );
}