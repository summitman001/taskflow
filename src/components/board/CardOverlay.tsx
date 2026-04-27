"use client";

import type { Card } from "@/types";

interface Props {
    card: Card;
}

export function CardOverlay({ card }: Props) {
    return (
        <div className="w-72 cursor-grabbing rounded-lg border border-slate-300 bg-white p-3 shadow-2xl ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-50/50 rotate-[3deg] scale-[1.02]">
            <p className="text-sm font-medium text-slate-900">{card.title}</p>
            {card.description && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {card.description}
                </p>
            )}
        </div>
    );
}