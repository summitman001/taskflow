"use client";

import { Loader2, ArrowRight, FileText, Pencil } from "lucide-react";
import { useCardActivity } from "@/hooks/useCardActivity";

interface Props {
    cardId: string;
}

export function CardActivityList({ cardId }: Props) {
    const { data, isLoading, isError } = useCardActivity(cardId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-6 text-sm text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading activity…
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                Could not load activity.
            </div>
        );
    }

    const { card, activities } = data;

    // Card create event'i de timeline'a ekle (sentetik olarak)
    const allEvents = [
        ...activities,
        {
            id: `created-${card.id}`,
            type: "created" as const,
            createdAt: card.createdAt,
            metadata: null,
            user: null,
        },
    ];

    // Tarih sırasıyla yeniden sırala (yeni → eski)
    const sortedEvents = allEvents.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Eğer son güncelleme oluşturma'dan farklıysa, "edited" ekleyelim
    // (ama sadece son edit'i, geçmiş edit'leri loglamıyoruz şimdilik)

    return (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
            {sortedEvents.map((event) => (
                <ActivityRow key={event.id} event={event} />
            ))}
        </div>
    );
}

function ActivityRow({
    event,
}: {
    event: {
        id: string;
        type: string;
        createdAt: string;
        metadata: { fromColumn?: { title: string }; toColumn?: { title: string } } | null;
        user: { name: string | null; email: string } | null;
    };
}) {
    const userLabel = event.user
        ? event.user.name || event.user.email.split("@")[0]
        : null;

    return (
        <div className="flex items-start gap-2.5 text-xs">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                <ActivityIcon type={event.type} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-slate-700">
                    <ActivityMessage event={event} userLabel={userLabel} />
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                    {formatRelativeTime(event.createdAt)}
                </p>
            </div>
        </div>
    );
}

function ActivityIcon({ type }: { type: string }) {
    if (type === "moved") return <ArrowRight className="h-3 w-3 text-blue-600" />;
    if (type === "created") return <FileText className="h-3 w-3 text-emerald-600" />;
    if (type === "edited") return <Pencil className="h-3 w-3 text-amber-600" />;
    return <ArrowRight className="h-3 w-3 text-slate-400" />;
}

function ActivityMessage({
    event,
    userLabel,
}: {
    event: { type: string; metadata: { fromColumn?: { title: string }; toColumn?: { title: string } } | null };
    userLabel: string | null;
}) {
    if (event.type === "created") {
        return <span>Card created</span>;
    }

    if (event.type === "edited") {
        return <span>Card details updated</span>;
    }

    if (event.type === "moved" && event.metadata?.fromColumn && event.metadata?.toColumn) {
        return (
            <span>
                {userLabel ? <strong className="font-medium text-slate-900">{userLabel}</strong> : "Card"} moved from{" "}
                <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium text-slate-700">
                    {event.metadata.fromColumn.title}
                </span>{" "}
                to{" "}
                <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium text-slate-700">
                    {event.metadata.toColumn.title}
                </span>
            </span>
        );
    }

    return <span>Activity</span>;
}

/**
 * Relative time formatter: "2m ago", "3h ago", "Mar 15"
 */
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    // 1 haftadan eski → tarih
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}