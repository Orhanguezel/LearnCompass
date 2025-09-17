# Node 20 LTS, küçük imaj
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* bun.lockb* yarn.lock* .npmrc* ./ 2>/dev/null || true
RUN npm i --no-audit --no-fund
COPY tsconfig.json .
COPY .eslintrc.cjs .
COPY src ./src
RUN npx tsc -p tsconfig.json


FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/package.json ./
RUN npm i --omit=dev --no-audit --no-fund
COPY --from=base /app/dist ./dist
CMD ["node", "dist/index"]