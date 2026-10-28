import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";

export function CheckerHeader() {
    return (
        <div className="flex items-center justify-between gap-3">
            <Link href="/add-food" aria-label="Back" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-card">
                <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="truncate font-display text-2xl uppercase">Calorie checker</h1>
            <Link href="/today" aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-card">
                <X className="h-5 w-5" />
            </Link>
        </div>
    );
}