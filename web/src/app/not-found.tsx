import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
    return (
        <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
            <div>
                <Link href="/">
                    <Logo />
                </Link>
                <p className="mt-12 text-xs uppercase tracking-[0.3em] text-primary">Error 404</p>
                <h1 className="mt-2 font-display text-6xl uppercase">Page not found</h1>
                <p className="mt-3 text-sm text-muted-foreground">The page you are looking for does not exist or was moved.</p>
                <Link
                    href="/today"
                    className="mt-8 inline-block rounded-sm bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground"
                >
                    Go to Today
                </Link>
            </div>
        </main>
    );
}