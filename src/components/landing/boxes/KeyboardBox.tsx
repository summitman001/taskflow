"use client";

import { Command } from "lucide-react";

const shortcuts = [
    { keys: ["N"], label: "New card" },
    { keys: ["?"], label: "Help" },
    { keys: ["Tab"], label: "Navigate" },
    { keys: ["Esc"], label: "Close" },
];

export function KeyboardBox() {
    return (
        <div className="flex h-full flex-col p-6">
            <Command className="h-5 w-5 text-slate-700" />
            <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
                Keyboard-first
            </h3>
            <p className="mt-1 text-xs text-slate-600">
                Built for power users & a11y.
            </p>

            <div className="mt-4 space-y-1.5">
                {shortcuts.map((s) => (
                    <div key={s.label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{s.label}</span>
                        <div className="flex gap-1">
                            {s.keys.map((k) => (
                                <kbd
                                    key={k}
                                    className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-700"
                                >
                                    {k}
                                </kbd>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}