FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 8081
CMD ["npx", "expo", "start", "--host", "lan", "--non-interactive"]
