"use client";

import { Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";

const subtasks = [
    "Choose CI provider (GitHub Actions vs CircleCI)",
    "Configure environment variables in Vercel",
    "Add deploy preview workflow",
    "Set up branch protection rules",
];

export function AIBox() {
    return (
        <div className="relative h-full p-6 md:p-8">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/50" />
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-200/30 blur-3xl" />

            <div className="relative flex h-full flex-col">
                {/* Badge */}
                <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-200 bg-violet-100/50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700">
                    <Sparkles className="h-3 w-3" />
                    AI-Powered
                </div>

                {/* Title */}
                <h3 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    Break down tasks
                    <br />
                    with one click.
                </h3>
                <p className="mb-6 text-sm text-slate-600">
                    Stuck on a complex task? AI suggests actionable subtasks you can add as cards instantly.
                </p>

                {/* Mock chat / output */}
                <div className="flex-1 space-y-2">
                    {/* User input bubble */}
                    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Your card
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                            Set up CI/CD pipeline
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center py-1">
                        <motion.div
                            animate={{ y: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-violet-400"
                        >
                            ↓
                        </motion.div>
                    </div>

                    {/* AI suggestions */}
                    <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-white to-violet-50/30 p-3 shadow-sm">
                        <p className="mb-2 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-violet-600">
                            <Sparkles className="h-2.5 w-2.5" />
                            AI Suggestions
                        </p>
                        <div className="space-y-1.5">
                            {subtasks.map((task, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 + i * 0.15, duration: 0.3 }}
                                    className="flex items-start gap-2"
                                >
                                    <div className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded border border-violet-300 bg-violet-100">
                                        <Check className="h-2 w-2 text-violet-700" />
                                    </div>
                                    <p className="text-xs text-slate-700">{task}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}