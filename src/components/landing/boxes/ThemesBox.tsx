"use client";

import { Palette } from "lucide-react";

const themePreviews = [
    "bg-slate-50",
    "bg-gradient-to-br from-blue-200 via-cyan-200 to-teal-200",
    "bg-gradient-to-br from-orange-200 via-pink-200 to-rose-200",
    "bg-gradient-to-br from-emerald-200 via-green-200 to-lime-200",
    "bg-gradient-to-br from-violet-200 via-purple-200 to-fuchsia-200",
    "bg-stone-300",
    "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900",
    "bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-800",
];

export function ThemesBox() {
    return (
        <div className="flex h-full flex-col p-6">
            <Palette className="h-5 w-5 text-slate-700" />
            <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
                Make it yours
            </h3>
            <p className="mt-1 text-xs text-slate-600">
                8 themes, saved per board.
            </p>

            <div className="mt-4 grid flex-1 grid-cols-4 gap-1.5">
                {themePreviews.map((cls, i) => (
                    <div
                        key={i}
                        className={`aspect-square rounded-md border border-slate-200/50 ${cls} transition-transform hover:-translate-y-0.5`}
                    />
                ))}
            </div>
        </div>
    );
}