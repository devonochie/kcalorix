import type { ReactNode } from "react";

/** A template (unlike a layout) is re-created on every navigation, so each page fades in. */
export default function Template({ children }: { children: ReactNode }) {
    return <div className="animate-page">{children}</div>;
}