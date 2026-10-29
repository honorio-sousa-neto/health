FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
COPY back/package.json back/package.json
COPY front/package.json front/package.json
RUN npm ci --workspace=back --include-workspace-root=false && mkdir -p back/node_modules
COPY back/ back/
RUN npm run db:generate --workspace=back && npm run build --workspace=back

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/back/package.json ./back/package.json
COPY --from=build /app/back/node_modules ./back/node_modules
COPY --from=build /app/back/build ./back/build
COPY --from=build /app/back/prisma ./back/prisma
COPY --from=build /app/back/image ./back/image
COPY --from=build /app/back/scripts/bootstrap.cjs ./back/scripts/bootstrap.cjs
WORKDIR /app/back
RUN mkdir -p private/uploads && chown -R node:node private
USER node
EXPOSE 8020
CMD ["node", "build/index.js"]
