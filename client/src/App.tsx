import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DestinationGuide from "./pages/DestinationGuide";
import Destinations from "./pages/Destinations";
import Faq from "./pages/Faq";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import PrivateExperience from "./pages/PrivateExperience";
import Privacy from "./pages/Privacy";
import ProposalView from "./pages/ProposalView";
import SchoolCruise from "@/pages/SchoolCruise";
import GroupProposalView from "@/pages/GroupProposalView";
import FamilyPortalView from "@/pages/FamilyPortalView";
import TravelerProfileView from "@/pages/TravelerProfileView";
import StaffLogin from "@/pages/StaffLogin";
import StaffPortalGuard from "@/components/StaffPortalGuard";
import WendyPipeline from "@/pages/wendy/WendyPipeline";
import WendyClients from "@/pages/wendy/WendyClients";
import WendyCalendar from "@/pages/wendy/WendyCalendar";
import WendyGroups from "@/pages/wendy/WendyGroups";
import WendyProposals from "@/pages/wendy/WendyProposals";
import WendyLibrary from "@/pages/wendy/WendyLibrary";
import { usePageMetadata } from "./hooks/usePageMetadata";
import ClientOnly from "./components/ClientOnly";

function Router() {
  const [location] = useLocation();
  usePageMetadata(location);
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/destinations" component={Destinations} />
    <Route path="/destinations/:slug" component={DestinationGuide} />
    <Route path="/faq" component={Faq} />
    <Route path="/contact" component={Contact} />
    <Route path="/privacy" component={Privacy} />
      <Route path="/experiences/grimsley-hs-graduation-cruise-2027" component={SchoolCruise} />
      <Route path="/group/:token" component={GroupProposalView} />
      <Route path="/family/:token" component={FamilyPortalView} />
      <Route path="/traveler-profile/:token" component={TravelerProfileView} />
      <Route path="/proposal/:token" component={ProposalView} />
    <Route path="/wendy/login" component={StaffLogin} />
    <Route path="/wendy/pipeline/:stage"><ClientOnly><StaffPortalGuard><WendyPipeline /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/wendy/pipeline"><ClientOnly><StaffPortalGuard><WendyPipeline /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/wendy/clients/new"><ClientOnly><StaffPortalGuard><WendyClients /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/wendy/clients/:id"><ClientOnly><StaffPortalGuard><WendyClients /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/wendy/clients"><ClientOnly><StaffPortalGuard><WendyClients /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/wendy/calendar"><ClientOnly><StaffPortalGuard><WendyCalendar /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/wendy/groups/:key"><ClientOnly><StaffPortalGuard><WendyGroups /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/wendy/groups"><ClientOnly><StaffPortalGuard><WendyGroups /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/wendy/proposals/new/:dealId"><ClientOnly><StaffPortalGuard><WendyProposals /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/wendy/proposals"><ClientOnly><StaffPortalGuard><WendyProposals /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/wendy/library"><ClientOnly><StaffPortalGuard><WendyLibrary /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/wendy"><ClientOnly><StaffPortalGuard><PrivateExperience /></StaffPortalGuard></ClientOnly></Route>
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
