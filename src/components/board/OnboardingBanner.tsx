"use client";

import { useEffect, useState } from "react";
import { Lightbulb, X } from "lucide-react";

const STORAGE_KEY = "taskflow:onboarding-banner-dismissed";

export function OnboardingBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(STORAGE_KEY);
        setIsVisible(!dismissed);
        setIsHydrated(true);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        try {
            localStorage.setItem(STORAGE_KEY, "true");
        } catch {
            // localStorage disabled, ok
        }
    };

    if (!isHydrated || !isVisible) return null;

    return (
        <div className="border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-2.5">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-indigo-900">
                    <Lightbulb className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                    <span className="hidden sm:inline">
                        <strong>Tip:</strong> Press{" "}
                        <kbd className="rounded border border-indigo-300 bg-white px-1.5 py-0.5 text-[11px] font-mono text-indigo-900">
                            N
                        </kbd>{" "}
                        to add a card · Click{" "}
                        <span className="font-medium">the palette icon</span> for themes ·
                        Drag cards to reorder
                    </span>
                    <span className="sm:hidden">
                        <strong>Tip:</strong> Long-press a card to drag, tap to edit
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleDismiss}
                    className="flex-shrink-0 rounded p-1 text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-900"
                    aria-label="Dismiss tip"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}