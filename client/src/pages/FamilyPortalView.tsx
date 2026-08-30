import { useRoute } from "wouter";
import SiteShell from "@/components/SiteShell";
import { SchoolCruiseContent, type FamilyCabinRequest } from "./SchoolCruise";
import { trpc } from "@/lib/trpc";

export default function FamilyPortalView() {
  const [, params] = useRoute("/family/:token");
  const token = params?.token || "";
  const portal = trpc.groupCruises.getFamilyPortal.useQuery({ token }, { enabled: token.length >= 32 });
  if (portal.isLoading) return <SiteShell darkHeader><main className="proposal-loading">Opening your private family portal.</main></SiteShell>;
  if (!portal.data) return <SiteShell darkHeader><main className="proposal-loading">This private family portal is no longer available. Please contact Wendy for a current link.</main></SiteShell>;
  return <SchoolCruiseContent familyPortalToken={token} profile={portal.data.profile} experience={portal.data.experience} initialRequest={portal.data.currentRequest as FamilyCabinRequest} revisionCount={portal.data.revisions.length} />;
}
