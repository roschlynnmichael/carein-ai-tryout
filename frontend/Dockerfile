# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
# If using yarn:
# COPY yarn.lock ./
# RUN yarn install --frozen-lockfile

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application for production
# ARG NEXT_PUBLIC_API_BASE_URL # If you need build-time env vars
# ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
RUN npm run build

# Stage 2: Serve the Next.js application from a lighter image
FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV production

# Copy built assets from the builder stage
# We need package.json for npm start to work correctly if it relies on 'next' from dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# If your npm start script needs node_modules (it usually doesn't for 'next start' with a build)
# you might need to copy node_modules or run npm install --production
# However, 'next start' typically uses the .next build output directly.

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next 
# Copy the entire .next folder

# If you have a custom server.js, uncomment and copy
# COPY --from=builder /app/server.js ./server.js

EXPOSE 3000

# Use npm start, which should execute 'next start' as per typical package.json
CMD ["npm", "start"]