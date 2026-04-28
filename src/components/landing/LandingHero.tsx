"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
    return (
        <section className="relative overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-violet-50 via-white to-white" />
                <div className="absolute left-1/2 top-32 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-200/30 blur-3xl" />
                <div className="absolute right-1/4 top-16 h-72 w-72 rounded-full bg-fuchsia-200/20 blur-3xl" />
            </div>

            <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                >
                    <Sparkles className="h-3 w-3" />
                    Now with AI subtask breakdown
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl"
                >
                    Kanban that thinks
                    <br />
                    <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text">
                        with you.
                    </span>
                </motion.h1>

                {/* Subline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto mt-6 max-w-xl text-base text-slate-600 md:text-lg"
                >
                    Drag, drop, and let AI break down complex tasks into actionable steps.
                    Built for small teams who ship fast.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
                >
                    <Button asChild size="lg" className="group">
                        <Link href="/sign-up">
                            Get started free
                            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/sign-in">Sign in</Link>
                    </Button>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-10 flex items-center justify-center gap-6 text-xs text-slate-500"
                >
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Free forever
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        No credit card
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                        Open source
                    </div>
                </motion.div>
            </div>
        </section>
    );
}