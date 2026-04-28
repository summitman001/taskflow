"use client";

import { Smartphone } from "lucide-react";

export function MobileBox() {
    return (
        <div className="flex h-full flex-col p-6">
            <Smartphone className="h-5 w-5 text-slate-700" />
            <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
                Built for thumbs
            </h3>
            <p className="mt-1 text-xs text-slate-600">
                Long-press to drag on mobile.
            </p>

            {/* Phone frame mockup */}
            <div className="mt-4 flex flex-1 items-end justify-center">
                <div className="relative w-24 rounded-[18px] border-4 border-slate-800 bg-slate-50 p-1.5 shadow-md">
                    <div className="space-y-1">
                        <div className="h-2 w-full rounded-sm bg-slate-300" />
                        <div className="rounded border border-slate-200 bg-white p-1">
                            <div className="h-1 w-3/4 rounded-sm bg-slate-300" />
                        </div>
                        <div className="rounded border border-slate-200 bg-white p-1 ring-1 ring-violet-300">
                            <div className="h-1 w-2/3 rounded-sm bg-slate-400" />
                        </div>
                        <div className="rounded border border-slate-200 bg-white p-1">
                            <div className="h-1 w-4/5 rounded-sm bg-slate-300" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}