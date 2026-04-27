import { Flame, AlertCircle, ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Priority = "low" | "medium" | "high";

export interface PriorityConfig {
    id: Priority;
    label: string;
    icon: LucideIcon;
    // Card üzerindeki dot rengi
    dotClassName: string;
    // Modal'daki seçici button'un rengi
    buttonClassName: string;
    // Card üzerindeki strip (sadece high)
    stripClassName: string;
}

export const priorities: Record<Priority, PriorityConfig> = {
    high: {
        id: "high",
        label: "High",
        icon: Flame,
        dotClassName: "bg-red-500",
        buttonClassName: "border-red-500 bg-red-50 text-red-700",
        stripClassName: "bg-red-500",
    },
    medium: {
        id: "medium",
        label: "Medium",
        icon: AlertCircle,
        dotClassName: "bg-amber-500",
        buttonClassName: "border-amber-500 bg-amber-50 text-amber-700",
        stripClassName: "bg-amber-500",
    },
    low: {
        id: "low",
        label: "Low",
        icon: ArrowDown,
        dotClassName: "bg-emerald-500",
        buttonClassName: "border-emerald-500 bg-emerald-50 text-emerald-700",
        stripClassName: "bg-emerald-500",
    },
};

export function getPriorityConfig(priority: string | null | undefined): PriorityConfig | null {
    if (!priority || !(priority in priorities)) return null;
    return priorities[priority as Priority];
}