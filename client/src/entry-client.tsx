import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { HydrationBoundary, QueryClient, QueryClientProvider, type DehydratedState } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Router } from "wouter";
import superjson from "superjson";
import App from "./App";
import { startLogin } from "./const";
import { trpc } from "./lib/trpc";
import "./index.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError) || typeof window === "undefined") return;
  if (error.message === UNAUTHED_ERR_MSG) startLogin();
};

queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.query.state.error);
    console.error("[API Query Error]", event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.mutation.state.error);
    console.error("[API Mutation Error]", event.mutation.state.error);
  }
});

const trpcClient = trpc.createClient({
  links: [httpBatchLink({
    url: "/api/trpc",
    transformer: superjson,
    headers() {
      try {
        const raw = sessionStorage.getItem("manus-cookie");
        const prefix = `${COOKIE_NAME}=`;
        const token = raw?.split(";").find((part) => part.trim().startsWith(prefix))?.trim().slice(prefix.length);
        if (token) return { Authorization: `Bearer ${token}` };
      } catch { /* session storage can be unavailable */ }
      return {};
    },
    fetch(input, init) { return globalThis.fetch(input, { ...(init ?? {}), credentials: "include" }); },
  })],
});

const rawState = (window as Window & { __RQ_STATE__?: ReturnType<typeof superjson.serialize> }).__RQ_STATE__;
const dehydratedState = rawState ? superjson.deserialize(rawState) as DehydratedState : undefined;
const app = <trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><HydrationBoundary state={dehydratedState}><Router><App /></Router></HydrationBoundary></QueryClientProvider></trpc.Provider>;
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
if (root.hasChildNodes()) hydrateRoot(root, app); else createRoot(root).render(app);
