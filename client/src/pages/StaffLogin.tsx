import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function StaffLogin() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const account = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const [username, setUsername] = useState<"wendy" | "junaid">("wendy");
  const [password, setPassword] = useState("");
  const login = trpc.auth.staffLogin.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/wendy", { replace: true });
    },
  });

  useEffect(() => {
    if (account.data?.role === "admin") setLocation("/wendy", { replace: true });
  }, [account.data?.role, setLocation]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ username, password });
  };

  return <main className="wendy-workspace"><section className="wendy-login-card staff-login-card"><p className="eyebrow">The Wendy Collective</p><h1 className="display display--small">Staff <em>login.</em></h1><p>This private workspace is for Wendy and Junaid. Client requests and private proposal links remain separate from this sign-in.</p><form className="staff-login-form" onSubmit={submit}><label htmlFor="staff-username">Account<select id="staff-username" value={username} onChange={(event) => setUsername(event.target.value as "wendy" | "junaid")} disabled={login.isPending}><option value="wendy">Wendy</option><option value="junaid">Junaid</option></select></label><label htmlFor="staff-password">Password<input id="staff-password" type="password" value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} disabled={login.isPending} required /></label><button className="button-submit" type="submit" disabled={login.isPending}>{login.isPending ? "Signing in" : "Open workspace"} <span aria-hidden="true">↗</span></button>{login.error ? <p className="form-error" role="alert">{login.error.message}</p> : null}</form><Link href="/" className="crm-text-link staff-login-card__return">Return to the website</Link></section></main>;
}
