"use client";

import type { ColumnWithCards } from "@/types";

interface Props {
    column: ColumnWithCards;
}

export function ColumnOverlay({ column }: Props) {
    return (
        <div className="flex h-full max-h-[600px] w-72 flex-col rounded-xl border border-slate-300 bg-slate-50/95 opacity-95 shadow-2xl ring-2 ring-blue-400 rotate-[2deg]">
            <div className="border-b border-slate-200/60 px-3 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span>{column.title}</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-600">
                        {column.cards.length}
                    </span>
                </h3>
            </div>
            <div className="space-y-2 overflow-hidden p-2">
                {column.cards.slice(0, 4).map((card) => (
                    <div
                        key={card.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                        <p className="text-sm font-medium text-slate-900">{card.title}</p>
                    </div>
                ))}
                {column.cards.length > 4 && (
                    <p className="px-2 text-xs text-slate-500">
                        +{column.cards.length - 4} more
                    </p>
                )}
            </div>
        </div>
    );
}