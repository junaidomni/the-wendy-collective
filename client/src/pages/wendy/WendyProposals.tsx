import { useState } from "react";
import { Link, useRoute } from "wouter";
import WendyShell from "./WendyShell";
import { trpc } from "@/lib/trpc";

type LegacyProposal = {
  id: string;
  title: string;
  client: string;
  occasion: string;
  travelWindow: string;
  route: string | null;
  hostedUrl: string | null;
  hosting: string;
  source: string;
  proposalMode: string;
  sourceStatus: string;
  reviewStatus: string;
  summary: string;
  knownDetails: string[];
  requiredBeforeSharing: string[];
  notes: string;
  sharePolicy: "not_shareable";
};

export default function WendyProposals() {
  const [, params] = useRoute("/wendy/proposals/new/:dealId");
  const [, archiveParams] = useRoute("/wendy/proposals/archive/:archiveId");
  const crm = trpc.crm.dashboard.useQuery();
  if (crm.isLoading || !crm.data)
    return (
      <WendyShell
        active="/wendy/proposals"
        eyebrow="Client links"
        title="Proposals"
      >
        <div className="crm-loading">Loading proposals.</div>
      </WendyShell>
    );
  const selectedDeal = params
    ? crm.data.deals.find(deal => deal.id === Number(params.dealId))
    : undefined;
  if (params && selectedDeal)
    return (
      <ProposalBuilder deal={selectedDeal} experiences={crm.data.experiences} />
    );
  const selectedArchive = archiveParams
    ? (crm.data.legacyProposals as LegacyProposal[]).find(item => item.id === archiveParams.archiveId)
    : undefined;
  if (archiveParams && selectedArchive) return <LegacyProposalDetail proposal={selectedArchive} />;
  const responseCount = (proposalId: number) =>
    crm.data?.responses.filter(response => response.proposalId === proposalId)
      .length || 0;
  const legacyProposals = crm.data.legacyProposals as LegacyProposal[];
  return (
    <WendyShell
      active="/wendy/proposals"
      eyebrow="Client links"
      title="Proposals"
    >
      <section className="crm-section-clean">
        <div className="crm-section-clean__heading">
          <div>
            <p className="eyebrow">Private proposal links</p>
            <h2>Only share a link you are ready to stand behind.</h2>
          </div>
          <p>
            Draft links stay private. Shared links collect details but never
            create a booking.
          </p>
        </div>
        <div className="proposal-list-clean">
          <ActiveGrimsleyProposal profile={crm.data.grimsleyProfile} experience={crm.data.grimsleyExperience} />
          {crm.data.proposals.map(proposal => (
            <ProposalRow
              key={proposal.id}
              proposal={proposal}
              responses={responseCount(proposal.id)}
            />
          ))}
          {!crm.data.proposals.length ? <p className="crm-empty-clean">Start from a client profile to prepare another private proposal.</p> : null}
        </div>
      </section>
      <LegacyProposalArchive proposals={legacyProposals} />
    </WendyShell>
  );
}

function LegacyProposalArchive({ proposals }: { proposals: LegacyProposal[] }) {
  return (
    <section
      className="legacy-proposal-archive"
      aria-labelledby="legacy-proposal-archive-title"
    >
      <header>
        <div>
          <p className="eyebrow">Legacy proposal archive</p>
          <h2 id="legacy-proposal-archive-title">
            Earlier work, safely retained.
          </h2>
        </div>
        <p>
          These are internal reference records reconstructed from the supplied
          handoff materials. They are not live pages, client links, quotes, or
          booking forms.
        </p>
      </header>
      <div className="legacy-proposal-archive__notice">
        <div>
          <strong>Active Grimsley program</strong>
          <span>
            Grimsley remains in its dedicated group record with its existing
            client link and submissions.
          </span>
        </div>
        <Link href="/wendy/groups/grimsley" className="crm-secondary-action">
          Open Grimsley
        </Link>
      </div>
      <div className="legacy-proposal-grid">
        {proposals.map(proposal => (
          <LegacyProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </section>
  );
}

function LegacyProposalCard({ proposal }: { proposal: LegacyProposal }) {
  return (
    <article className="legacy-proposal-card">
      <header>
        <span>Internal reference</span>
        <strong>{proposal.reviewStatus}</strong>
      </header>
      <div className="legacy-proposal-card__body">
        <p className="eyebrow">{proposal.occasion}</p>
        <h3>{proposal.title}</h3>
        <p className="legacy-proposal-card__client">{proposal.client}</p>
        <p>{proposal.travelWindow}</p>
        <p>{proposal.summary}</p>
        <div className="legacy-proposal-card__actions">
          <Link href={`/wendy/proposals/archive/${proposal.id}`} className="crm-secondary-action">Open recovered record</Link>
          {proposal.hostedUrl ? <a href={proposal.hostedUrl} target="_blank" rel="noreferrer" className="crm-text-link">Open external host ↗</a> : null}
        </div>
      </div>
      <details>
        <summary>Review archived details</summary>
        <div className="legacy-proposal-card__details">
          <dl>
            <div>
              <dt>Recovered route</dt>
              <dd>{proposal.route || "No verified route available"}</dd>
            </div>
            <div>
              <dt>Hosting and access</dt>
              <dd>{proposal.hosting}</dd>
            </div>
            <div>
              <dt>Proposal format</dt>
              <dd>{proposal.proposalMode}</dd>
            </div>
            <div>
              <dt>Source status</dt>
              <dd>{proposal.sourceStatus}</dd>
            </div>
            <div>
              <dt>Handoff source</dt>
              <dd>{proposal.source}</dd>
            </div>
          </dl>
          <section>
            <h4>Known details</h4>
            <ul>
              {proposal.knownDetails.map(detail => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </section>
          <section>
            <h4>Required before sharing</h4>
            <ul>
              {proposal.requiredBeforeSharing.map(detail => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </section>
          <p className="legacy-proposal-card__note">{proposal.notes}</p>
        </div>
      </details>
      <footer>
        <span>Client sharing disabled</span>
        <small>Source verification and Wendy approval required</small>
      </footer>
    </article>
  );
}

function ActiveGrimsleyProposal({ profile, experience }: { profile: unknown; experience: unknown }) {
  const group = profile as { profile?: { title?: string; workflowStage?: string; shareStatus?: string; privateToken?: string | null; expiresAt?: Date | null }; cabinRequests?: Array<{ id: number; contactFirstName: string; contactLastName: string; email: string; roomCount: number; revisionNumber: number; status: string }> } | null;
  const ship = experience as { shipName?: string; sailingSummary?: string; title?: string } | null;
  if (!group?.profile) return null;
  const requests = group.cabinRequests || [];
  const link = group.profile.privateToken ? `${window.location.origin}/experiences/grimsley-hs-graduation-cruise-2027?family=${group.profile.privateToken}` : null;
  return <article className="proposal-row proposal-row--group"><div><span>Active group proposal</span><h3>{group.profile.title || "Grimsley High School Graduation Cruise 2027"}</h3><p>{ship?.shipName || "Carnival Mardi Gras"} · {ship?.sailingSummary || "Existing client proposal"} · {requests.length} submission{requests.length === 1 ? "" : "s"}</p></div><div><small>{group.profile.shareStatus === "shared" ? "Shared link retained" : "Link not activated"}</small><Link href="/wendy/groups/grimsley" className="crm-secondary-action">Open proposal workspace</Link>{link ? <a href={link} target="_blank" rel="noreferrer" className="crm-text-link">Open client link ↗</a> : null}</div><details><summary>View submissions</summary><div className="proposal-submission-list">{requests.length ? requests.map(request => <div key={request.id}><strong>{request.contactFirstName} {request.contactLastName}</strong><span>{request.email} · {request.roomCount} room{request.roomCount === 1 ? "" : "s"} · Update {request.revisionNumber} · {request.status}</span></div>) : <p>No family submissions yet.</p>}</div></details></article>;
}

function LegacyProposalDetail({ proposal }: { proposal: LegacyProposal }) {
  return <WendyShell active="/wendy/proposals" eyebrow="Recovered proposal" title={proposal.title} action={<Link href="/wendy/proposals" className="crm-secondary-action">Back to proposals</Link>}><section className="legacy-proposal-detail"><header><div><p className="eyebrow">{proposal.occasion}</p><h2>{proposal.title}</h2><p className="legacy-proposal-card__client">{proposal.client}</p><p>{proposal.travelWindow}</p></div><strong>{proposal.reviewStatus}</strong></header><div className="legacy-proposal-detail__banner"><span>Internal recovery record</span><p>This view is for Wendy’s review. Client sharing is disabled until source, dates, supplier details, and the safe intake workflow are approved.</p></div><dl><div><dt>Proposal format</dt><dd>{proposal.proposalMode}</dd></div><div><dt>Recovered route</dt><dd>{proposal.route || "No verified route available"}</dd></div><div><dt>Hosting</dt><dd>{proposal.hosting}</dd></div><div><dt>Source status</dt><dd>{proposal.sourceStatus}</dd></div><div><dt>Source</dt><dd>{proposal.source}</dd></div></dl><section><h3>Known details</h3><ul>{proposal.knownDetails.map(item => <li key={item}>{item}</li>)}</ul></section><section><h3>Required before sharing</h3><ul>{proposal.requiredBeforeSharing.map(item => <li key={item}>{item}</li>)}</ul></section><p className="legacy-proposal-card__note">{proposal.notes}</p>{proposal.hostedUrl ? <a href={proposal.hostedUrl} target="_blank" rel="noreferrer" className="crm-secondary-action">Open recovered external proposal ↗</a> : null}</section></WendyShell>;
}

function ProposalBuilder({
  deal,
  experiences,
}: {
  deal: {
    id: number;
    title: string;
    contactFirstName: string;
    contactLastName: string;
    stage: string;
  };
  experiences: Array<{ id: number; shipName: string; sailingSummary: string }>;
}) {
  const [form, setForm] = useState({
    title: deal.title,
    experienceId: "",
    summary: "",
    pricing: "",
    roomGuidance: "",
    validForDays: "30",
  });
  const [proposalId, setProposalId] = useState<number | null>(null);
  const create = trpc.crm.createProposal.useMutation({
    onSuccess: result => setProposalId(result.proposalId),
  });
  return (
    <WendyShell
      active="/wendy/proposals"
      eyebrow="Proposal builder"
      title={`Build for ${deal.contactFirstName}`}
      action={
        <Link
          href={`/wendy/clients/${deal.id}`}
          className="crm-secondary-action"
        >
          Return to profile
        </Link>
      }
    >
      <section className="focus-form focus-form--wide">
        <div>
          <p className="eyebrow">Client proposal</p>
          <h2>
            {deal.contactFirstName} {deal.contactLastName}
          </h2>
          <p>
            Create the client safe version of Wendy’s recommendation. Internal
            notes and unverified supplier details stay in the profile.
          </p>
        </div>
        {proposalId ? (
          <div className="crm-success">
            <h3>Proposal created as a private draft.</h3>
            <p>
              Review it in Proposals, then deliberately copy and share the link
              when ready.
            </p>
            <Link href="/wendy/proposals" className="crm-primary-action">
              Open proposals
            </Link>
          </div>
        ) : (
          <form
            onSubmit={event => {
              event.preventDefault();
              create.mutate({
                dealId: deal.id,
                title: form.title,
                experienceId: form.experienceId
                  ? Number(form.experienceId)
                  : undefined,
                summary: form.summary,
                pricingSummary: form.pricing,
                roomGuidance: form.roomGuidance,
                validForDays: Number(form.validForDays),
              });
            }}
          >
            <div className="form-grid">
              <Input
                id="proposal-title"
                label="Proposal title"
                value={form.title}
                onChange={value => setForm({ ...form, title: value })}
                wide
              />
              <div className="form-field">
                <label htmlFor="proposal-experience">
                  Use an approved experience
                </label>
                <select
                  id="proposal-experience"
                  value={form.experienceId}
                  onChange={event =>
                    setForm({ ...form, experienceId: event.target.value })
                  }
                >
                  <option value="">A tailored trip</option>
                  {experiences.map(experience => (
                    <option key={experience.id} value={experience.id}>
                      {experience.shipName} · {experience.sailingSummary}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="proposal-valid">Link active for</label>
                <select
                  id="proposal-valid"
                  value={form.validForDays}
                  onChange={event =>
                    setForm({ ...form, validForDays: event.target.value })
                  }
                >
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                </select>
              </div>
              <Input
                id="proposal-summary"
                label="Personal proposal message"
                value={form.summary}
                onChange={value => setForm({ ...form, summary: value })}
                text
                wide
              />
              <Input
                id="proposal-pricing"
                label="Approved pricing guidance"
                value={form.pricing}
                onChange={value => setForm({ ...form, pricing: value })}
                text
                wide
              />
              <Input
                id="proposal-room"
                label="Room and cabin guidance"
                value={form.roomGuidance}
                onChange={value => setForm({ ...form, roomGuidance: value })}
                text
                wide
              />
            </div>
            <button
              className="crm-primary-action"
              type="submit"
              disabled={create.isPending}
            >
              Create private draft
            </button>
          </form>
        )}
      </section>
    </WendyShell>
  );
}

function ProposalRow({
  proposal,
  responses,
}: {
  proposal: {
    id: number;
    dealId: number;
    title: string;
    status: string;
    expiresAt: Date | null;
    createdAt: Date;
    privateToken: string;
  };
  responses: number;
}) {
  const markShared = trpc.crm.markProposalShared.useMutation();
  const copy = async () => {
    const link = `${window.location.origin}/proposal/${proposal.privateToken}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("Copy the private proposal link", link);
    }
    await markShared.mutateAsync({ id: proposal.id });
  };
  return (
    <article>
      <div>
        <span>{proposal.status === "shared" ? "Shared" : "Draft"}</span>
        <h3>{proposal.title}</h3>
        <p>
          Created {new Date(proposal.createdAt).toLocaleDateString()} ·{" "}
          {responses} response{responses === 1 ? "" : "s"}
        </p>
      </div>
      <div>
        <small>
          {proposal.expiresAt
            ? `Expires ${new Date(proposal.expiresAt).toLocaleDateString()}`
            : "No expiry"}
        </small>
        <button
          className="crm-secondary-action"
          type="button"
          onClick={copy}
          disabled={markShared.isPending}
        >
          {proposal.status === "shared" ? "Copy link" : "Copy and share"}
        </button>
      </div>
    </article>
  );
}
function Input({
  id,
  label,
  value,
  onChange,
  wide,
  text,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
  text?: boolean;
}) {
  return (
    <div className={`form-field${wide ? " form-field--wide" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {text ? (
        <textarea
          id={id}
          value={value}
          onChange={event => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={event => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
