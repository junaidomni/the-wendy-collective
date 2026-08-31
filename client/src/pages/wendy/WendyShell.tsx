import type { ReactNode } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

const navigation = [
  { href: "/wendy", label: "Today" },
  { href: "/wendy/pipeline", label: "Pipeline" },
  { href: "/wendy/clients", label: "Clients" },
  { href: "/wendy/calendar", label: "Calendar" },
  { href: "/wendy/groups", label: "Trips and groups" },
  { href: "/wendy/proposals", label: "Proposals" },
  { href: "/wendy/library", label: "Library" },
];

export default function WendyShell({ active, title, eyebrow, action, children }: { active: string; title: string; eyebrow: string; action?: ReactNode; children: ReactNode }) {
  const { user, loading } = useAuth();
  const isOwner = user?.role === "admin";
  if (loading) return <main className="wendy-workspace"><div className="wendy-login-card"><p className="eyebrow">The Wendy Collective</p><h1 className="display display--small">Preparing your workspace.</h1></div></main>;
  if (!user) return <main className="wendy-workspace"><div className="wendy-login-card"><p className="eyebrow">The Wendy Collective</p><h1 className="display display--small">Wendy’s <em>workspace.</em></h1><p>Sign in to manage conversations, proposals, and travel plans.</p><button type="button" className="button-submit" onClick={() => startLogin()}>Wendy login <span aria-hidden="true">↗</span></button></div></main>;
  if (!isOwner) return <main className="wendy-workspace"><div className="wendy-login-card"><p className="eyebrow">The Wendy Collective</p><h1 className="display display--small">This space is reserved for <em>Wendy.</em></h1><p>Please return to the main site to begin your travel conversation.</p></div></main>;
  return <main className="crm-app"><aside className="crm-sidebar"><Link href="/wendy" className="crm-brand"><span>TWC</span><strong>The Wendy Collective</strong></Link><nav aria-label="Wendy workspace navigation">{navigation.map((item) => <Link key={item.href} href={item.href} className={active === item.href ? "is-active" : ""}>{item.label}</Link>)}</nav><div className="crm-sidebar__footer"><span>Advisor workspace</span><strong>{user.name || "Wendy"}</strong></div></aside><section className="crm-main"><header className="crm-page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{action}</header>{children}</section></main>;
}
