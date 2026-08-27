import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

function destinations(value: string) {
  try { return JSON.parse(value).join(", "); } catch { return value; }
}

export default function PrivateExperience() {
  const { user, loading } = useAuth();
  const isOwner = user?.role === "admin";
  const dashboard = trpc.privateExperience.dashboard.useQuery(undefined, { enabled: isOwner });

  if (loading) return <main className="wendy-workspace"><div className="wendy-login-card"><p className="eyebrow">The Wendy Collective</p><h1 className="display display--small">Preparing your workspace.</h1></div></main>;
  if (!user) return <main className="wendy-workspace"><div className="wendy-login-card"><p className="eyebrow">The Wendy Collective</p><h1 className="display display--small">Wendy’s <em>workspace.</em></h1><p>Sign in to review the personal trip briefs waiting for you.</p><button type="button" className="button-submit" onClick={() => startLogin()}>Wendy login <span aria-hidden="true">↗</span></button></div></main>;
  if (!isOwner) return <main className="wendy-workspace"><div className="wendy-login-card"><p className="eyebrow">The Wendy Collective</p><h1 className="display display--small">This space is reserved for <em>Wendy.</em></h1><p>Please return to the main site to begin your travel conversation.</p></div></main>;

  return <main className="wendy-workspace"><div className="wendy-workspace__inner"><header className="wendy-workspace__header"><div><p className="eyebrow">The Wendy Collective</p><h1 className="display display--small">Wendy’s <em>workspace.</em></h1><p>Here are the travel conversations waiting for your personal touch.</p></div><span>{dashboard.data?.inquiries.length ?? 0} trip briefs</span></header>{dashboard.isLoading ? <div className="wendy-login-card"><p>Loading your trip briefs.</p></div> : dashboard.error ? <div className="wendy-login-card"><p>Trip briefs are not available right now. Please refresh and try again.</p></div> : <section className="inquiry-ledger" aria-label="Submitted trip briefs">{dashboard.data?.inquiries.length ? dashboard.data.inquiries.map((inquiry) => <article className="inquiry-ledger__item" key={inquiry.id}><div className="inquiry-ledger__identity"><span>{inquiry.createdAt.toLocaleDateString()}</span><h2>{inquiry.firstName} {inquiry.lastName}</h2><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a><a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a></div><div className="inquiry-ledger__details"><p><strong>{inquiry.travelType}</strong> · {destinations(inquiry.destinations)}</p><p>{inquiry.travelTiming} · {inquiry.dateFlexibility} · {inquiry.groupSize} travelers</p><p>Budget: {inquiry.budget}</p>{inquiry.priorities && <p className="inquiry-ledger__note">“{inquiry.priorities}”</p>}</div><span className={`inquiry-status inquiry-status--${inquiry.status}`}>{inquiry.status}</span></article>) : <div className="wendy-login-card"><p>No trip briefs have arrived yet. New inquiries will appear here after travelers submit the trip brief.</p></div>}</section>}</div></main>;
}
