"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const shortcuts = [
    { keys: ["N"], description: "Add card to first column" },
    { keys: ["Esc"], description: "Close any open dialog" },
    { keys: ["?"], description: "Show this cheatsheet" },
    { keys: ["Tab"], description: "Navigate between cards" },
    { keys: ["Space"], description: "Pick up / drop card (when focused)" },
    { keys: ["↑", "↓", "←", "→"], description: "Move card while dragging" },
    { keys: ["Enter"], description: "Save title (when editing)" },
];

export function KeyboardShortcutsButton() {
    const [open, setOpen] = useState(false);

    // ? tuşu ile aç/kapa
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            {/* Floating button */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:bg-slate-50 hover:text-slate-900 hover:shadow-xl"
                aria-label="Keyboard shortcuts (?)"
                title="Keyboard shortcuts (press ?)"
            >
                <Keyboard className="h-4 w-4" />
            </button>

            {/* Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Keyboard shortcuts</DialogTitle>
                        <DialogDescription>
                            Speed up your workflow with these shortcuts.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-2 space-y-2">
                        {shortcuts.map((shortcut, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-slate-50"
                            >
                                <span className="text-slate-700">{shortcut.description}</span>
                                <div className="flex items-center gap-1">
                                    {shortcut.keys.map((key, j) => (
                                        <kbd
                                            key={j}
                                            className="rounded border border-slate-300 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700"
                                        >
                                            {key}
                                        </kbd>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-2 text-center text-[11px] text-slate-400">
                        All shortcuts also work via mouse and touch
                    </p>
                </DialogContent>
            </Dialog>
        </>
    );
}