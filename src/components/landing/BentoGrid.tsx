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
        <section className="mx-auto max-w-6xl px-6 py-16">
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
            className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-lg ${className}`}
        >
            {children}
        </motion.div>
    );
}