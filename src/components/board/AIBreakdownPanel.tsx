"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, X, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIBreakdown, type AISubtask } from "@/hooks/useAIBreakdown";
import { useCreateCard } from "@/hooks/useCards";
import { getPositionAtEnd } from "@/lib/positioning";
import { toast } from "sonner";
import type { ColumnWithCards } from "@/types";

interface Props {
    cardId: string;
    columnId: string;
    columnCards: ColumnWithCards["cards"];
    boardId: string;
    onCardsAdded?: () => void;
}

/**
 * AI ile kartı subtask'lara bölme paneli.
 * Modal içinde inline olarak render edilir.
 */
export function AIBreakdownPanel({
    cardId,
    columnId,
    columnCards,
    boardId,
    onCardsAdded,
}: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [suggestions, setSuggestions] = useState<AISubtask[] | null>(null);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [isMock, setIsMock] = useState(false);

    const breakdown = useAIBreakdown();
    const createCard = useCreateCard(boardId);

    const generate = async () => {
        setIsExpanded(true);
        try {
            const result = await breakdown.mutateAsync(cardId);
            setSuggestions(result.subtasks);
            setIsMock(result.isMock);
            // Default: tüm subtask'lar seçili
            setSelected(new Set(result.subtasks.map((_, i) => i)));
        } catch {
            // Toast zaten useAIBreakdown'da gösteriliyor
        }
    };

    const regenerate = () => {
        setSuggestions(null);
        setSelected(new Set());
        generate();
    };

    const toggleOne = (index: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const addSelected = async () => {
        if (!suggestions) return;
        const toAdd = Array.from(selected)
            .sort((a, b) => a - b)
            .map((i) => suggestions[i]);

        if (toAdd.length === 0) return;

        // Mevcut kart pozisyonlarını al, hepsini en sona ekle
        const allCards = [...columnCards];
        let prevPos: string | null =
            allCards.length > 0 ? allCards[allCards.length - 1].position : null;

        try {
            for (const sub of toAdd) {
                // Her kart için sequential position hesapla
                const { generateKeyBetween } = await import("fractional-indexing");
                const newPos = generateKeyBetween(prevPos, null);
                prevPos = newPos;

                await createCard.mutateAsync({
                    columnId,
                    title: sub.title,
                    position: newPos,
                });
            }

            toast.success(
                `Added ${toAdd.length} subtask${toAdd.length === 1 ? "" : "s"}`,
            );

            // Reset
            setSuggestions(null);
            setSelected(new Set());
            setIsExpanded(false);
            onCardsAdded?.();
        } catch (error) {
            toast.error("Some subtasks couldn't be added");
        }
    };

    const close = () => {
        setIsExpanded(false);
        setSuggestions(null);
        setSelected(new Set());
    };

    // Collapsed state: sadece "Break down" butonu
    if (!isExpanded) {
        return (
            <button
                type="button"
                onClick={generate}
                disabled={breakdown.isPending}
                className="group flex items-center gap-2 rounded-md border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-3 py-2 text-xs font-medium text-violet-700 transition hover:border-violet-300 hover:from-violet-100 hover:to-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Sparkles className="h-3.5 w-3.5 text-violet-600 group-hover:text-violet-700" />
                Break down into subtasks with AI
            </button>
        );
    }

    // Expanded: loading or suggestions
    return (
        <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 p-3">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-900">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Suggestions
                </div>
                <button
                    type="button"
                    onClick={close}
                    className="rounded p-1 text-violet-600 hover:bg-violet-100"
                    aria-label="Close suggestions"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            {breakdown.isPending && (
                <div className="flex items-center justify-center py-6 text-xs text-violet-700">
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Analyzing your card…
                </div>
            )}

            {!breakdown.isPending && suggestions && (
                <>
                    {isMock && (
                        <div className="mb-2 flex items-start gap-1.5 rounded-md bg-amber-50 p-2 text-[11px] text-amber-800">
                            <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
                            <span>
                                AI is not configured. Showing example subtasks.
                                Add <code className="rounded bg-amber-100 px-1">OPENAI_API_KEY</code> for real AI suggestions.
                            </span>
                        </div>
                    )}

                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {suggestions.map((sub, i) => (
                            <SubtaskRow
                                key={i}
                                subtask={sub}
                                isSelected={selected.has(i)}
                                onToggle={() => toggleOne(i)}
                            />
                        ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={regenerate}
                            disabled={breakdown.isPending || createCard.isPending}
                            className="flex items-center gap-1 text-[11px] font-medium text-violet-700 hover:text-violet-900 disabled:opacity-50"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Regenerate
                        </button>

                        <Button
                            size="sm"
                            onClick={addSelected}
                            disabled={selected.size === 0 || createCard.isPending}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            {createCard.isPending ? (
                                <>
                                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                    Adding…
                                </>
                            ) : (
                                <>
                                    <Check className="mr-1.5 h-3 w-3" />
                                    Add {selected.size} card{selected.size === 1 ? "" : "s"}
                                </>
                            )}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

/* ----- Subtask satırı ----- */

function SubtaskRow({
    subtask,
    isSelected,
    onToggle,
}: {
    subtask: AISubtask;
    isSelected: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`flex w-full items-start gap-2 rounded-md border bg-white p-2 text-left transition ${isSelected
                    ? "border-violet-300 ring-1 ring-violet-200"
                    : "border-slate-200 hover:border-slate-300"
                }`}
        >
            <div
                className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${isSelected
                        ? "border-violet-500 bg-violet-500 text-white"
                        : "border-slate-300 bg-white"
                    }`}
            >
                {isSelected && <Check className="h-2.5 w-2.5" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900">{subtask.title}</p>
                {subtask.description && (
                    <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                        {subtask.description}
                    </p>
                )}
            </div>
        </button>
    );
}