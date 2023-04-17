FROM node:alpine as builder
WORKDIR /usr/src
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build

FROM node:alpine
WORKDIR /usr/src
RUN npm install -g pnpm
COPY --from=builder /usr/src/dist ./dist
COPY package.json pnpm-lock.yaml ./
ENV HOST=0.0.0.0 PORT=3331 NODE_ENV=production
RUN pnpm start -p $PORT
EXPOSE $PORT