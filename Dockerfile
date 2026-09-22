FROM node:18-alpine
WORKDIR /app
RUN npm i -g expo-cli
COPY package*.json ./
RUN npm ci 2>/dev/null || npm install --legacy-peer-deps
COPY . .
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV NODE_OPTIONS=--openssl-legacy-provider
EXPOSE 19000 19001 19002 8081
CMD ["sh", "-c", "npx expo start --non-interactive"]
