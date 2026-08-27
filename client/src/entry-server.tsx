import { QueryClient, QueryClientProvider, dehydrate } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import superjson from "superjson";
import App from "./App";
import { trpc } from "./lib/trpc";
import { prefetchForPath, type HeadMeta } from "./ssr/prefetch";

export type RenderResult = { html: string; dehydratedState: unknown; head: HeadMeta };

export async function render(url: string): Promise<RenderResult> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
  const divider = url.indexOf("?");
  const ssrPath = divider === -1 ? url : url.slice(0, divider);
  const ssrSearch = divider === -1 ? "" : url.slice(divider + 1);
  const head = prefetchForPath(url);
  const trpcClient = trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })] });
  const html = renderToString(<trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><Router ssrPath={ssrPath} ssrSearch={ssrSearch}><App /></Router></QueryClientProvider></trpc.Provider>);
  return { html, dehydratedState: dehydrate(queryClient), head };
}
