FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY lib ./lib
COPY public ./public
COPY local-server.js ./

USER node
EXPOSE 3000
CMD ["node", "local-server.js"]
