import { useState } from "react";
import { trpc } from "@/lib/trpc";

type PublicInquiryDeal = {
  id: number;
  sourceType?: string;
  sourceId?: number | null;
  stage: string;
  title: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
};

export default function PublicInquiryDeletionControl() {
  const crm = trpc.crm.dashboard.useQuery();
  const remove = trpc.crm.deletePublicInquiry.useMutation({ onSuccess: () => crm.refetch() });
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const inquiries = ((crm.data?.deals || []) as PublicInquiryDeal[]).filter((deal) => deal.sourceType === "trip_inquiry" && deal.sourceId && deal.stage === "new_inquiry");
  const selected = inquiries.find((deal) => deal.sourceId === selectedId);
  if (!inquiries.length) return null;
  const close = () => { if (remove.isPending) return; setOpen(false); setSelectedId(null); setConfirmation(""); };
  const confirmDelete = async () => {
    if (!selected || confirmation !== "DELETE" || !selected.sourceId) return;
    await remove.mutateAsync({ id: selected.sourceId, confirmation: "DELETE" });
    close();
  };
  return <><button type="button" className="public-inquiry-delete-launch" onClick={() => setOpen(true)}>Manage website inquiries</button>{open ? <div className="public-inquiry-delete-backdrop" role="presentation"><section className="public-inquiry-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="public-inquiry-delete-title"><header><div><p className="eyebrow">Wendy only</p><h2 id="public-inquiry-delete-title">Delete a website inquiry</h2></div><button type="button" className="crm-text-link" onClick={close}>Close</button></header>{!selected ? <><p>Select a new website inquiry. Deleting it permanently removes its public form record, derived New Inquiry client record, workflow history, and related portal alert. Grimsley and private proposal submissions are not affected.</p><div className="public-inquiry-delete-list">{inquiries.map((inquiry) => <button type="button" key={inquiry.id} onClick={() => setSelectedId(inquiry.sourceId!)}><span><strong>{inquiry.contactFirstName} {inquiry.contactLastName}</strong><small>{inquiry.title} · {inquiry.email}</small></span><i aria-hidden="true">→</i></button>)}</div></> : <><p><strong>{selected.contactFirstName} {selected.contactLastName}</strong> and their original website inquiry will be permanently removed. The record cannot be restored. Active private proposals are protected and cannot be deleted from this control.</p><label htmlFor="public-inquiry-delete-confirmation">Type DELETE to confirm</label><input id="public-inquiry-delete-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /><div className="public-inquiry-delete-actions"><button type="button" className="crm-secondary-action" onClick={() => { setSelectedId(null); setConfirmation(""); }}>Back</button><button type="button" className="crm-danger-action" disabled={confirmation !== "DELETE" || remove.isPending} onClick={confirmDelete}>{remove.isPending ? "Deleting" : "Permanently delete"}</button></div>{remove.error ? <p className="stage-error">{remove.error.message}</p> : null}</>}</section></div> : null}</>;
}
