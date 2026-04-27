"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateColumn } from "@/hooks/useColumns";
import { useBoardTheme } from "@/hooks/useTheme";
import { getPositionAtEnd } from "@/lib/positioning";
import type { Column } from "@/types";

interface Props {
    boardId: string;
    existingColumns: Column[];
}

export function AddColumnButton({ boardId, existingColumns }: Props) {
    const { theme } = useBoardTheme(boardId);
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const createColumn = useCreateColumn(boardId);

    useEffect(() => {
        if (isAdding) {
            inputRef.current?.focus();
        }
    }, [isAdding]);

    const handleSubmit = () => {
        const trimmed = title.trim();
        if (!trimmed) return;

        const position = getPositionAtEnd(existingColumns);
        createColumn.mutate(
            { title: trimmed, position },
            {
                onSuccess: () => {
                    setTitle("");
                    setIsAdding(false);
                },
            },
        );
    };

    if (!isAdding) {
        return (
            <button
                type="button"
                onClick={() => setIsAdding(true)}
                className={`flex h-12 w-72 flex-shrink-0 items-center justify-center gap-1 rounded-lg border-2 border-dashed text-sm transition ${
                    theme.isDark
                        ? "border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800/30"
                        : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                }`}
            >
                <Plus className="h-4 w-4" />
                Add column
            </button>
        );
    }

    return (
        <div className="w-72 flex-shrink-0 rounded-lg bg-slate-100 p-3">
            <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                    if (e.key === "Escape") {
                        setTitle("");
                        setIsAdding(false);
                    }
                }}
                placeholder="Column title"
                maxLength={200}
                className="mb-2 bg-white"
            />
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!title.trim() || createColumn.isPending}
                >
                    {createColumn.isPending ? "Adding…" : "Add column"}
                </Button>
                <button
                    type="button"
                    onClick={() => {
                        setTitle("");
                        setIsAdding(false);
                    }}
                    className="rounded p-1 text-slate-500 hover:bg-slate-200"
                    aria-label="Cancel"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}