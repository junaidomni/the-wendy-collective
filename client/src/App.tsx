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
    <Route path="/wendy"><ClientOnly><PrivateExperience /></ClientOnly></Route>
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
