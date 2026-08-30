import { Link, useRoute } from "wouter";
import WendyShell from "./WendyShell";
import { trpc } from "@/lib/trpc";
import { dealStages, dealStageLabels, groupPipelineStage, type DealStage } from "./types";

function stageFromRoute(value?: string): DealStage | undefined { return dealStages.includes(value as DealStage) ? value as DealStage : undefined; }

export default function WendyPipeline() {
  const [, params] = useRoute("/wendy/pipeline/:stage");
  const selectedStage = stageFromRoute(params?.stage);
  const crm = trpc.crm.dashboard.useQuery();
  const data = crm.data;
  const title = selectedStage ? dealStageLabels[selectedStage] : "Pipeline";
  if (crm.isLoading || !data) return <WendyShell active="/wendy/pipeline" eyebrow="Client work" title={title}><div className="crm-loading">Loading the pipeline.</div></WendyShell>;
  const stageDeals = selectedStage ? data.deals.filter((deal) => deal.stage === selectedStage) : [];
  const grimsleyVisible = !!(selectedStage && data.grimsleyProfile && groupPipelineStage[data.grimsleyProfile.profile.stage] === selectedStage);
  return <WendyShell active="/wendy/pipeline" eyebrow="Client work" title={title} action={<Link href="/wendy/clients/new" className="crm-primary-action">New client <span aria-hidden="true">+</span></Link>}>
    <nav className="pipeline-tabs" aria-label="Pipeline stages">{dealStages.map((stage) => <Link key={stage} href={`/wendy/pipeline/${stage}`} className={selectedStage === stage ? "is-active" : ""}><span>{dealStageLabels[stage]}</span><strong>{data.deals.filter((deal) => deal.stage === stage).length + (data.grimsleyProfile && groupPipelineStage[data.grimsleyProfile.profile.stage] === stage ? 1 : 0)}</strong></Link>)}</nav>
    {!selectedStage && <section className="pipeline-intro"><p className="eyebrow">Choose a stage</p><h2>Each stage contains the complete work for that moment.</h2><p>Select a stage above to see every active client or group, their next action, and a direct link to the full profile. Booked and closed records remain available in Clients and Trips and groups.</p></section>}
    {selectedStage && <section className="stage-view"><header><div><p className="eyebrow">{dealStageLabels[selectedStage]}</p><h2>{stageDeals.length + (grimsleyVisible ? 1 : 0)} active record{stageDeals.length + (grimsleyVisible ? 1 : 0) === 1 ? "" : "s"}</h2></div><p>{selectedStage === "new_inquiry" ? "New requests waiting for Wendy’s first personal response." : selectedStage === "proposal_shared" ? "Client links are active. Review responses and follow up deliberately." : "Open a record to see contact details, notes, trip context, and the next action."}</p></header><div className="stage-records">{grimsleyVisible && <Link href="/wendy/groups/grimsley" className="stage-record stage-record--group"><span>Group program</span><strong>{data.grimsleyProfile?.profile.title}</strong><p>{data.grimsleyProfile?.profile.organizationName}</p><small>{data.grimsleyProfile?.cabinRequests.length ?? 0} family request{(data.grimsleyProfile?.cabinRequests.length ?? 0) === 1 ? "" : "s"} · {data.grimsleyProfile?.profile.stage.replaceAll("_", " ")}</small><i aria-hidden="true">Open profile ↗</i></Link>}{stageDeals.map((deal) => <Link key={deal.id} href={`/wendy/clients/${deal.id}`} className="stage-record"><span>Client</span><strong>{deal.contactFirstName} {deal.contactLastName}</strong><p>{deal.title}</p><small>{deal.nextAction || "No next action set"}</small><i aria-hidden="true">Open profile ↗</i></Link>)}{!stageDeals.length && !grimsleyVisible && <p className="crm-empty-clean">No active records in this stage. Use the tabs above to see the rest of the pipeline.</p>}</div></section>}
  </WendyShell>;
}
