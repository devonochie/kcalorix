"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Home, NotebookText, Dumbbell, BarChart3, User, Plus, Bell, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useLogout } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-notifications";
import { Logo } from "@/components/ui/Logo";

const NAV = [
  { label: "Today", icon: Home, to: "/today" },
  { label: "Diary", icon: NotebookText, to: "/diary" },
  { label: "Workouts", icon: Dumbbell, to: "/workouts" },
  { label: "Progress", icon: BarChart3, to: "/progress" },
  { label: "Profile", icon: User, to: "/profile" },
] as const;

const spring = { type: "spring", stiffness: 500, damping: 35 } as const;

const isActive = (path: string, to: string) =>
    path === to ||
    path.startsWith(`${to}/`) ||
    (to === "/workouts" && (path === "/exercises" || path.startsWith("/exercises/")));

function NavItem({ item, active, mobile }: { item: (typeof NAV)[number]; active: boolean; mobile?: boolean }) {
  const Icon = item.icon;

  if (mobile) {
    return (
        <Link
            href={item.to}
            className={`relative flex flex-col items-center gap-1 px-1 pt-1 text-[10px] uppercase tracking-widest transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
        >
          {active && <motion.span layoutId="nav-mobile-bar" className="absolute -top-2 h-0.5 w-8 rounded-full bg-primary" transition={spring} />}
          <motion.span animate={{ scale: active ? 1.15 : 1, y: active ? -1 : 0 }} transition={spring} className="grid place-items-center">
            <Icon className="h-5 w-5" />
          </motion.span>
          {item.label}
        </Link>
    );
  }

  return (
      <Link
          href={item.to}
          className={`relative flex items-center gap-3 rounded-sm px-4 py-3 text-sm uppercase tracking-widest transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
      >
        {/* This pill slides from the old page's item to the new one. */}
        {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-sm bg-primary/15" transition={spring} />}
        <Icon className="relative h-4 w-4" />
        <span className="relative">{item.label}</span>
      </Link>
  );
}

/** Red dot on the bell. Pops in whenever the unread count changes. */
function UnreadDot({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
      <motion.span
          key={count}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary"
      />
  );
}

export function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  const unread = useUnreadCount();
  return (
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">{kicker}</p>
          <h1 className="font-display text-4xl uppercase break-words md:text-5xl">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {children}
          <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative grid h-11 w-11 place-items-center rounded-full border bg-card transition-transform active:scale-90"
          >
            <Bell className="h-4 w-4" />
            <UnreadDot count={unread} />
          </Link>
        </div>
      </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const logout = useLogout();
  return (
      <div className="app-light bg-app min-h-dvh pb-[calc(6rem+env(safe-area-inset-bottom))] text-foreground lg:flex lg:pb-0">
        <aside className="hidden w-64 shrink-0 flex-col border-r bg-card/70 px-4 py-8 backdrop-blur lg:flex">
          <Link href="/" className="px-4">
            <Logo />
          </Link>
          <nav className="mt-10 space-y-1">
            {NAV.map((n) => (
                <NavItem key={n.label} item={n} active={isActive(path, n.to)} />
            ))}
          </nav>
          <Link
              href="/add-food"
              className="mt-8 flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Log food
          </Link>
          <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="mt-auto flex items-center gap-3 rounded-sm px-4 py-3 text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 flex items-end justify-around border-t bg-card px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
          {NAV.slice(0, 2).map((n) => (
              <NavItem key={n.label} item={n} active={isActive(path, n.to)} mobile />
          ))}
          <Link
              href="/add-food"
              aria-label="Log food"
              className="-mt-8 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-90"
          >
            <Plus className="h-6 w-6" />
          </Link>
          {NAV.slice(2, 5).map((n) => (
              <NavItem key={n.label} item={n} active={isActive(path, n.to)} mobile />
          ))}
        </nav>
      </div>
  );
}