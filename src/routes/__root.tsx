import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, useRouterState, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Home, Rocket, Coins, Users, Trophy, RefreshCw, BookOpen, Menu, X, Copy } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { pillDark } from "@/components/ui-bits";

function NotFoundComponent() {
  return (
    <div className="py-24 text-center">
      <h1 className="font-display text-7xl font-medium">404</h1>
      <p className="mt-4 text-muted-foreground">This page doesn't exist.</p>
      <Link to="/" className={`${pillDark} mt-6`}>Back home</Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="py-24 text-center">
      <h1 className="text-xl font-semibold">This page didn't load</h1>
      <button onClick={() => { router.invalidate(); reset(); }} className={`${pillDark} mt-6`}>Try again</button>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MINIONS — The AI memecoin agency" },
      { name: "description", content: "Launch a Solana memecoin with a squad of 5 autonomous AI minions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/launch", label: "Launch", icon: Rocket },
  { to: "/coins", label: "Coins", icon: Coins },
  { to: "/squad", label: "Squad", icon: Users },
  { to: "/milestones", label: "Milestones", icon: Trophy },
  { to: "/flywheel", label: "Flywheel", icon: RefreshCw },
  { to: "/docs", label: "Docs", icon: BookOpen },
] as const;

const CA = "M1N1oNsQuEsT7aGeNtSpUmPxYz";

function SidebarBody({ onNav }: { onNav?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link to="/" onClick={onNav} className="flex items-center gap-3 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground shadow-md">M</span>
        <span>
          <span className="flex items-center gap-1.5 font-display text-xl font-bold tracking-tight">MINIONS
            <span className="rounded-full border border-accent/40 bg-accent/10 px-1.5 py-px font-mono text-[8px] font-semibold tracking-widest text-accent">BETA</span>
          </span>
          <span className="block text-[11px] text-muted-foreground">The AI memecoin agency · Solana</span>
        </span>
      </Link>
      <nav className="mt-10 space-y-1">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} onClick={onNav} activeOptions={{ exact: n.to === "/" }}
            className="relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground"
            activeProps={{ className: "bg-card shadow-sm ring-1 ring-border !text-foreground font-semibold before:absolute before:-left-4 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-accent" }}>
            <n.icon className="h-4 w-4" strokeWidth={1.75} /> {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-1 px-3 pt-8 text-xs text-muted-foreground">
        <Link to="/docs" onClick={onNav} className="block hover:text-foreground">Terms</Link>
        <Link to="/docs" onClick={onNav} className="block hover:text-foreground">Privacy</Link>
        <Link to="/docs" onClick={onNav} className="block hover:text-foreground">Risk disclosure</Link>
        <div className="pt-3">© 2026 minions.quest</div>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const isHome = useRouterState({ select: (r) => r.location.pathname }) === "/";
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen w-full">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r bg-card/40 px-4 py-6 backdrop-blur lg:block">
          <SidebarBody />
        </aside>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-foreground/20" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-64 border-r bg-background px-4 py-6 animate-slidein">
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-3 p-2"><X className="h-4 w-4" /></button>
              <SidebarBody onNav={() => setOpen(false)} />
            </aside>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur md:px-8">
            <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-full border p-2 lg:hidden"><Menu className="h-4 w-4" /></button>
            <span className="font-display text-lg font-bold lg:hidden">MINIONS</span>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => { navigator.clipboard?.writeText(CA); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 font-mono text-xs shadow-sm transition hover:shadow-md sm:inline-flex">
                <span className="text-muted-foreground">CA</span> {copied ? "Copied!" : `${CA.slice(0, 4)}…${CA.slice(-4)}`} <Copy className="h-3 w-3" />
              </button>
              <span className="hidden items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 font-mono text-[10px] font-semibold shadow-sm md:inline-flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />SOLANA</span>
              <button className={`${pillDark} !py-1.5 !px-4 shadow-md`}>Connect Wallet</button>
            </div>
          </header>
          <main className={isHome ? "w-full flex-1" : "mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-8"}><Outlet /></main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
