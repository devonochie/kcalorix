import type { ReactNode } from "react";
import { AuthGate } from "@/components/shell/AuthGate";


export default function FlowLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGate>
            <div className="app-light bg-app min-h-dvh text-foreground">{children}</div>
        </AuthGate>
    );
}