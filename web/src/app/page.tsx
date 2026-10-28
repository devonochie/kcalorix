"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLogout, useMe } from "@/hooks/use-auth";
import { Logo } from "@/components/ui/Logo";
import { Background } from "@/components/ui/Background";
import type { BackgroundConfig } from "@/lib/backgrounds";

const SLIDES: { bg: BackgroundConfig; kicker: string; title: string; tag: string }[] = [
  {
    bg: { type: "video", src: "/videos/bg.mp4", webm: "/videos/bg.webm", poster: "/images/auth-poster.jpg" },
    kicker: "Know what",
    title: "You eat",
    tag: "Food diary",
  },
  {
    bg: { type: "video", src: "/videos/bg.mp4", webm: "/videos/bg.webm", poster: "/images/auth-poster.jpg" },
    kicker: "Scan your",
    title: "Plate",
    tag: "Photo calorie checker",
  },
  {
    bg: { type: "video", src: "/videos/bg.mp4", webm: "/videos/bg.webm", poster: "/images/auth-poster.jpg" },
    kicker: "Train with",
    title: "Purpose",
    tag: "Workout logging",
  },
  {
    bg: { type: "video", src: "/videos/bg.mp4", webm: "/videos/bg.webm", poster: "/images/auth-poster.jpg" },
    kicker: "See your",
    title: "Progress",
    tag: "Trends & weight",
  },
];
const NAV_LINKS = [
  { label: "Food diary", href: "/diary" },
  { label: "Calorie checker", href: "/calorie-checker" },
  { label: "Workouts", href: "/workouts" },
  { label: "Progress", href: "/progress" },
];

const HIGHLIGHTS = [
  ["Scan", "Meals by photo"],
  ["Track", "Calories & macros"],
  ["Train", "Log every set"],
];
const DURATION = 6000;

export default function LandingPage() {
  const [i, setI] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading } = useMe();
  const logout = useLogout();

  useEffect(() => {
    const t = setTimeout(() => setI((n) => (n + 1) % SLIDES.length), DURATION);
    return () => clearTimeout(t);
  }, [i]);

  const s = SLIDES[i % SLIDES.length]!;

  const displayName = user?.displayName || user?.email || "";
  const initials = displayName
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("");

  return (
      <main className="relative h-screen min-h-[640px] w-full overflow-hidden bg-background">
        {SLIDES.map((sl, idx) => (
            <div
                key={sl.tag}
                className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
            >
              <Background config={sl.bg} />
            </div>
        ))}
        <div className="absolute inset-0 bg-scrim" />

        <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
          <Logo />

          {/* Nav links only for logged-in users, so visitors never click into a login wall */}
          {user && (
              <nav className="hidden gap-10 text-sm uppercase tracking-widest text-muted-foreground md:flex">
                {NAV_LINKS.map((n) => (
                    <Link key={n.href} href={n.href} className="transition-colors hover:text-foreground">
                      {n.label}
                    </Link>
                ))}
              </nav>
          )}

          {user ? (
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-1.5 backdrop-blur-md sm:pr-5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-sm text-primary-foreground">
                    {initials}
                  </span>
                  <span className="hidden leading-tight sm:block">
                    <span className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Welcome back</span>
                    <span className="block max-w-[160px] truncate text-sm font-bold text-foreground">{displayName}</span>
                  </span>
                </div>
                <Link
                    href="/today"
                    className="hidden rounded-sm bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground md:inline-block"
                >
                  Dashboard
                </Link>
                <button
                    type="button"
                    disabled={logout.isPending}
                    onClick={() => logout.mutate()}
                    className="hidden border px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-primary md:inline-block"
                >
                  Log out
                </button>
                <button
                    type="button"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((o) => !o)}
                    className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 backdrop-blur-md md:hidden"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    {menuOpen ? (
                        <path d="M4 4l12 12M16 4L4 16" />
                    ) : (
                        <path d="M3 5h14M3 10h14M3 15h14" />
                    )}
                  </svg>
                </button>
              </div>
          ) : isLoading ? (
              <span className="text-sm text-muted-foreground">Connecting…</span>
          ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary">
                  Log in
                </Link>
                <Link
                    href="/register"
                    className="rounded-sm bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Join now
                </Link>
              </div>
          )}

          {user && menuOpen && (
              <div className="absolute inset-x-0 top-full flex flex-col border-y bg-background/95 px-6 py-2 backdrop-blur-md md:hidden">
                {NAV_LINKS.map((n) => (
                    <Link
                        key={n.href}
                        href={n.href}
                        onClick={() => setMenuOpen(false)}
                        className="border-b py-4 text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {n.label}
                    </Link>
                ))}
                <Link
                    href="/today"
                    onClick={() => setMenuOpen(false)}
                    className="my-4 rounded-sm bg-primary px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground"
                >
                  Dashboard
                </Link>
                <button
                    type="button"
                    disabled={logout.isPending}
                    onClick={() => logout.mutate()}
                    className="mb-4 border px-5 py-3 text-xs font-bold uppercase tracking-widest hover:border-primary"
                >
                  Log out
                </button>
              </div>
          )}
        </header>

        <section key={i} className="relative z-10 flex h-[calc(100%-180px)] flex-col justify-center px-6 md:px-12">
          <p className="animate-fadeup mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-10 bg-primary" /> {s.tag}
          </p>
          <h1 className="font-display uppercase leading-[0.9] text-[clamp(3.5rem,11vw,10rem)]">
          <span className="block overflow-hidden">
            <span className="animate-rise block text-outline">{s.kicker}</span>
          </span>
            <span className="block overflow-hidden">
            <span className="animate-rise block text-primary" style={{ animationDelay: "120ms" }}>
              {s.title}
            </span>
          </span>
          </h1>
          <div
              className="animate-fadeup mt-8 flex max-w-md flex-col gap-6 sm:flex-row sm:items-center"
              style={{ animationDelay: "300ms" }}
          >
            <Link
                href={user ? "/today" : "/register"}
                className="rounded-sm bg-primary px-7 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {user ? "Open app" : "Start tracking"}
            </Link>
            <p className="text-sm text-muted-foreground">
              Log your meals, scan your plate and track every workout, all in one place.
            </p>
          </div>
        </section>

        <div className="absolute inset-x-0 bottom-0 z-10 grid gap-6 border-t px-6 py-6 md:grid-cols-[1fr_auto] md:px-12">
          <div className="flex gap-10 md:gap-16">
            {HIGHLIGHTS.map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl text-primary md:text-4xl">{n}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
                </div>
            ))}
          </div>
          <div className="flex items-end gap-3">
            {SLIDES.map((sl, idx) => (
                <button
                    key={sl.tag}
                    type="button"
                    onClick={() => setI(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className="group w-14 text-left md:w-20"
                >
              <span className={`mb-2 block font-display text-sm ${idx === i ? "text-foreground" : "text-muted-foreground"}`}>
                0{idx + 1}
              </span>
                  <span className="block h-0.5 w-full overflow-hidden bg-border">
                {idx === i && (
                    <span
                        key={i}
                        className="animate-fill block h-full w-full bg-primary"
                        style={{ animationDuration: `${DURATION}ms` }}
                    />
                )}
                    {idx < i && <span className="block h-full w-full bg-foreground/60" />}
              </span>
                </button>
            ))}
          </div>
        </div>
      </main>
  );
}