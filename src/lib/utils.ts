import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * String ID'den deterministik bir pastel renk üret.
 * Aynı ID hep aynı rengi verir → board renkleri kalıcı.
 */
export function getColorFromId(id: string): string {
  // Basit string hash
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  // 12 farklı pastel renk havuzu
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-fuchsia-500",
    "bg-lime-500",
  ];
  return colors[Math.abs(hash) % colors.length];
}
