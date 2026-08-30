import { Link } from "wouter";
import WendyShell from "./WendyShell";
import { trpc } from "@/lib/trpc";
import { dealStageLabels, groupStageLabels, groupPipelineStage } from "./types";

export default function WendyToday() {
  const crm = trpc.crm.dashboard.useQuery();
  const data = crm.data;
  if (crm.isLoading || !data) return <WendyShell active="/wendy" eyebrow="Advisor workspace" title="Today"><div className="crm-loading">Preparing your workspace.</div></WendyShell>;
  const activeDeals = data.deals.filter((deal) => !["booked", "closed"].includes(deal.stage));
  const sharedProposals = data.proposals.filter((proposal) => proposal.status === "shared");
  const grimsley = data.grimsleyProfile;
  const nextWork = [
    ...activeDeals.filter((deal) => deal.nextAction).slice(0, 5).map((deal) => ({ id: `deal-${deal.id}`, type: "Client", title: `${deal.contactFirstName} ${deal.contactLastName}`, detail: deal.nextAction || "Open client profile", href: `/wendy/clients/${deal.id}` })),
    ...(grimsley ? [{ id: "grimsley", type: "Group program", title: grimsley.profile.title, detail: grimsley.profile.stage === "group_setup" ? "Complete group details before sharing" : groupStageLabels[grimsley.profile.stage], href: "/wendy/groups/grimsley" }] : []),
  ].slice(0, 6);
  return <WendyShell active="/wendy" eyebrow="Advisor workspace" title="Today" action={<Link href="/wendy/clients/new" className="crm-primary-action">New client <span aria-hidden="true">+</span></Link>}>
    <section className="crm-overview"><article><span>Active conversations</span><strong>{activeDeals.length}</strong><Link href="/wendy/pipeline">Open pipeline</Link></article><article><span>Awaiting response</span><strong>{sharedProposals.length}</strong><Link href="/wendy/proposals">Open proposals</Link></article><article><span>Family submissions</span><strong>{grimsley?.cabinRequests.length ?? 0}</strong><Link href="/wendy/groups/grimsley">Open Grimsley</Link></article></section>
    <section className="crm-section-clean"><div className="crm-section-clean__heading"><div><p className="eyebrow">Priority work</p><h2>What needs your attention.</h2></div><p>Open the record, finish the next action, then move it forward.</p></div><div className="today-list">{nextWork.length ? nextWork.map((item) => <Link key={item.id} href={item.href}><span>{item.type}</span><strong>{item.title}</strong><p>{item.detail}</p><i aria-hidden="true">↗</i></Link>) : <p className="crm-empty-clean">Your active work will appear here as inquiries and family requests arrive.</p>}</div></section>
    <section className="crm-section-clean"><div className="crm-section-clean__heading"><div><p className="eyebrow">Pipeline at a glance</p><h2>Move one conversation at a time.</h2></div><Link href="/wendy/pipeline" className="crm-text-link">See every stage</Link></div><div className="stage-strip">{Object.entries(dealStageLabels).filter(([stage]) => stage !== "closed").map(([stage, label]) => { const count = data.deals.filter((deal) => deal.stage === stage).length + (grimsley && groupPipelineStage[grimsley.profile.stage] === stage ? 1 : 0); return <Link key={stage} href={`/wendy/pipeline/${stage}`}><span>{label}</span><strong>{count}</strong></Link>; })}</div></section>
  </WendyShell>;
}
