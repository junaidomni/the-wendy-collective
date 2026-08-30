import { useRoute } from "wouter";
import SiteShell from "@/components/SiteShell";
import { SchoolCruiseContent } from "./SchoolCruise";
import { trpc } from "@/lib/trpc";

export default function GroupProposalView() {
  const [, params] = useRoute("/group/:token");
  const token = params?.token || "";
  const proposal = trpc.crm.getPrivateGroupProfile.useQuery({ token }, { enabled: token.length >= 32 });
  if (proposal.isLoading) return <SiteShell darkHeader><main className="proposal-loading">Preparing your private group proposal.</main></SiteShell>;
  if (!proposal.data) return <SiteShell darkHeader><main className="proposal-loading">This private group proposal is no longer available. Please contact Wendy for a current link.</main></SiteShell>;
  return <SchoolCruiseContent privateToken={token} profile={proposal.data.profile} experience={proposal.data.experience} />;
}
