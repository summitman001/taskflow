"use client";

import { Palette, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { themes, type Theme } from "@/lib/themes";

interface Props {
    currentThemeId: string;
    onChange: (themeId: string) => void;
}

export function ThemePicker({ currentThemeId, onChange }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    aria-label="Change board theme"
                >
                    <Palette className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-3">
                <DropdownMenuLabel className="px-1 text-xs font-medium text-slate-500">
                    Board background
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />

                <div className="grid grid-cols-4 gap-2">
                    {themes.map((theme) => (
                        <ThemeSwatch
                            key={theme.id}
                            theme={theme}
                            isSelected={theme.id === currentThemeId}
                            onClick={() => onChange(theme.id)}
                        />
                    ))}
                </div>

                <p className="mt-3 px-1 text-[11px] text-slate-400">
                    Saved per board, on this device.
                </p>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function ThemeSwatch({
    theme,
    isSelected,
    onClick,
}: {
    theme: Theme;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative flex h-12 w-full items-center justify-center rounded-md border-2 transition ${isSelected
                    ? "border-indigo-500 ring-2 ring-indigo-500/20"
                    : "border-slate-200 hover:border-slate-300"
                } ${theme.previewClassName}`}
            aria-label={`${theme.name} theme${isSelected ? " (selected)" : ""}`}
            title={theme.name}
        >
            {isSelected && (
                <div className="rounded-full bg-white/90 p-1 shadow-sm">
                    <Check className="h-3 w-3 text-indigo-600" />
                </div>
            )}
        </button>
    );
}