FROM node:20-slim

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/indexer/package.json ./packages/indexer/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --filter @arisanaman/indexer...

COPY packages/shared ./packages/shared
COPY packages/indexer ./packages/indexer

WORKDIR /app/packages/indexer

EXPOSE 42069

CMD ["pnpm", "start"]












