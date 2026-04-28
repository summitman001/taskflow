"use client";

import { LayoutGrid, Activity, CheckCircle2 } from "lucide-react";
import type { BoardListItem } from "@/hooks/useBoards";

interface Props {
    boards: BoardListItem[];
}

export function BoardsStats({ boards }: Props) {
    // Total cards across all boards
    const totalCards = boards.reduce(
        (sum, b) => sum + b.columns.reduce((s, c) => s + c._count.cards, 0),
        0,
    );

    // "Done" column cards (basit: en sondaki column'un kartlarını sayıyoruz)
    // Pratikte: column title "Done" içeren her column'un kartlarını topla
    const doneCards = boards.reduce((sum, b) => {
        const doneCol = b.columns.find((c) =>
            c.title.toLowerCase().includes("done"),
        );
        return sum + (doneCol?._count.cards ?? 0);
    }, 0);

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
                icon={<LayoutGrid className="h-4 w-4" />}
                label="Total boards"
                value={boards.length}
                accent="indigo"
            />
            <StatCard
                icon={<Activity className="h-4 w-4" />}
                label="Total cards"
                value={totalCards}
                accent="blue"
            />
            <StatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Cards done"
                value={doneCards}
                accent="emerald"
            />
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    accent: "indigo" | "blue" | "emerald";
}) {
    const accentClasses = {
        indigo: "text-indigo-600 bg-indigo-50",
        blue: "text-blue-600 bg-blue-50",
        emerald: "text-emerald-600 bg-emerald-50",
    };

    return (
        <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md">
            {/* Top edge highlight */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
            />

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900">
                        {value}
                    </p>
                </div>
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentClasses[accent]}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}