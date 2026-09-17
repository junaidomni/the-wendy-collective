import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function StaffPortalGuard({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const account = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });

  useEffect(() => {
    if (!account.isLoading && account.data?.role !== "admin") setLocation("/wendy/login", { replace: true });
  }, [account.data?.role, account.isLoading, setLocation]);

  if (account.isLoading) return <main className="wendy-workspace"><div className="wendy-login-card"><p className="eyebrow">The Wendy Collective</p><h1 className="display display--small">Preparing your workspace.</h1></div></main>;
  if (account.data?.role !== "admin") return <main className="wendy-workspace"><div className="wendy-login-card"><p className="eyebrow">The Wendy Collective</p><h1 className="display display--small">Opening staff <em>login.</em></h1></div></main>;
  return <>{children}</>;
}
