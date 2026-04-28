"use client";

import { motion } from "framer-motion";
import { AIBox } from "./boxes/AIBox";
import { ThemesBox } from "./boxes/ThemesBox";
import { MobileBox } from "./boxes/MobileBox";
import { KeyboardBox } from "./boxes/KeyboardBox";
import { DragDropBox } from "./boxes/DragDropBox";
import { ActivityBox } from "./boxes/ActivityBox";

export function BentoGrid() {
    return (
        <section className="relative mx-auto max-w-6xl px-6 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="mb-12 text-center"
            >
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                    Everything you need.
                    <span className="text-slate-400"> Nothing you don&apos;t.</span>
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">
                    A focused set of features that make project management feel effortless.
                </p>
            </motion.div>

            {/* Asymmetric bento grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-[auto_auto]">
                {/* Row 1 */}
                <BentoCell delay={0} className="md:col-span-2 md:row-span-2">
                    <AIBox />
                </BentoCell>

                <BentoCell delay={0.1}>
                    <ThemesBox />
                </BentoCell>

                <BentoCell delay={0.2}>
                    <MobileBox />
                </BentoCell>

                {/* Row 2 */}
                <BentoCell delay={0.3}>
                    <KeyboardBox />
                </BentoCell>

                <BentoCell delay={0.4} className="md:col-span-2">
                    <DragDropBox />
                </BentoCell>

                <BentoCell delay={0.5} className="md:col-span-3">
                    <ActivityBox />
                </BentoCell>
            </div>
        </section>
    );
}

function BentoCell({
    children,
    delay,
    className = "",
}: {
    children: React.ReactNode;
    delay: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_-4px_rgba(124,58,237,0.08),0_4px_12px_-2px_rgba(15,23,42,0.06)] ${className}`}
        >
            {/* Inner highlight — top edge'de ince beyaz çizgi */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
            />

            {/* Subtle inner ring — premium hissi */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/50"
            />

            {/* Content */}
            <div className="relative">{children}</div>
        </motion.div>
    );
}