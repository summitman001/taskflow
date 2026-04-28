"use client";

import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

export function DragDropBox() {
    return (
        <div className="relative h-full overflow-hidden p-6">
            <MousePointer2 className="h-5 w-5 text-slate-700" />
            <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
                Drag &amp; drop, with feeling
            </h3>
            <p className="mt-1 text-xs text-slate-600">
                Optimistic updates. Fractional indexing. Smooth at any scale.
            </p>

            {/* 3 column mock */}
            <div className="mt-5 grid grid-cols-3 gap-2">
                {/* To Do */}
                <div className="rounded-md bg-slate-50 p-2">
                    <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        To Do
                    </div>
                    <div className="space-y-1">
                        <div className="rounded border border-slate-200 bg-white p-1.5">
                            <div className="h-1 w-3/4 rounded-sm bg-slate-300" />
                        </div>
                    </div>
                </div>

                {/* In Progress */}
                <div className="rounded-md bg-slate-50 p-2">
                    <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        Doing
                    </div>
                    <div className="space-y-1">
                        <div className="rounded border border-slate-200 bg-white p-1.5">
                            <div className="h-1 w-2/3 rounded-sm bg-slate-300" />
                        </div>
                    </div>
                </div>

                {/* Done */}
                <div className="rounded-md bg-slate-50 p-2">
                    <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        Done
                    </div>
                    <div className="space-y-1">
                        <div className="rounded border border-slate-200 bg-white p-1.5">
                            <div className="h-1 w-4/5 rounded-sm bg-slate-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Animated card flying across */}
            <motion.div
                initial={{ x: 0 }}
                animate={{
                    x: ["0%", "0%", "100%", "200%", "200%", "0%"],
                    y: [0, 0, 0, 0, 0, 0],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.15, 0.45, 0.55, 0.85, 1],
                }}
                className="pointer-events-none absolute left-[8%] top-[60%] w-[28%] rounded-md border-2 border-violet-400 bg-white p-1.5 shadow-lg"
            >
                <div className="h-1 w-3/4 rounded-sm bg-slate-700" />
                <div className="mt-1 h-0.5 w-1/2 rounded-sm bg-slate-300" />
            </motion.div>
        </div>
    );
}