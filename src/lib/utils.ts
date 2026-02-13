import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBranchName(name: string): string {
  if (!name) return "";
  // Remove padrões como "01 - ", "02 - ", etc.
  return name.replace(/^\d+\s*-\s*/, "").trim();
}