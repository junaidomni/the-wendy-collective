# Self-hosted build of The Wendy Collective (Railway or any Docker host).
# The same repo still deploys on Manus; this image always runs SELF_HOST=1.
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY . .
# Build-time switches: drop Manus vite plugins; analytics tag only if provided.
ENV SELF_HOST=1
ARG VITE_ANALYTICS_ENDPOINT
ARG VITE_ANALYTICS_WEBSITE_ID
RUN pnpm build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production \
    SELF_HOST=1 \
    PORT=3000
# The server bundle keeps packages external (incl. vite for the dev path), so
# ship the installed node_modules from the build stage.
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/vite.config.ts ./vite.config.ts
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/tsconfig.json ./tsconfig.json
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
