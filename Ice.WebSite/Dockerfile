FROM node:14-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY . .

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]