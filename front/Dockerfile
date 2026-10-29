FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY back/package.json back/package.json
COPY front/package.json front/package.json
RUN npm ci --workspace=front --include-workspace-root=false
COPY front/ front/
ENV API_URL=/api
RUN npm run build --workspace=front

FROM nginx:stable-alpine
COPY docker/front/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/front/dist/spa /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
