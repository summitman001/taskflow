"use client";

import type { ColumnWithCards } from "@/types";

interface Props {
    column: ColumnWithCards;
}

export function ColumnOverlay({ column }: Props) {
    return (
        <div className="flex h-full max-h-[600px] w-72 flex-col rounded-lg bg-slate-100 opacity-90 shadow-xl ring-2 ring-blue-400">
            <div className="px-3 py-3">
                <h3 className="text-sm font-semibold text-slate-700">
                    {column.title}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                        {column.cards.length}
                    </span>
                </h3>
            </div>
            <div className="space-y-2 overflow-hidden px-2 pb-2">
                {column.cards.slice(0, 4).map((card) => (
                    <div
                        key={card.id}
                        className="rounded-md border border-slate-200 bg-white p-3 shadow-sm"
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