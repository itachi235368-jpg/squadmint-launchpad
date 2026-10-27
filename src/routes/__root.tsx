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
      { name: "description", content: "Launch a Solana memecoin with a squad of 7 autonomous AI agents." },
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
      <Link to="/" onClick={onNav} className="block px-2">
        <div className="font-display text-2xl font-bold tracking-tight">MINIONS</div>
        <div className="text-xs text-muted-foreground">The AI memecoin agency</div>
      </Link>
      <nav className="mt-10 space-y-1">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} onClick={onNav} activeOptions={{ exact: n.to === "/" }}
            className="flex items-center gap-3 rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary !text-foreground font-semibold" }}>
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
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r px-4 py-6 lg:block">
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
                className="hidden items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs sm:inline-flex">
                <span className="text-muted-foreground">CA</span> {copied ? "Copied!" : `${CA.slice(0, 4)}…${CA.slice(-4)}`} <Copy className="h-3 w-3" />
              </button>
              <button className={`${pillDark} !py-1.5 !px-4`}>Connect wallet</button>
            </div>
          </header>
          <main className={isHome ? "w-full flex-1" : "mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-8"}><Outlet /></main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
