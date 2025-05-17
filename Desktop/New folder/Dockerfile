# Use Node.js LTS (Latest Long Term Support) as the base image
FROM node:20-alpine AS base

# Set the working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
FROM base AS deps
COPY package.json package-lock.json* ./
# Using --legacy-peer-deps to handle the incompatible peer dependencies
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM deps AS builder
WORKDIR /app
COPY . .

# Environment variables needed for the build
ENV NEXT_TELEMETRY_DISABLED=1
ENV ESLINT_SKIP=true
ENV NODE_ENV=production
ENV NEXT_PHASE=phase-production-build
# Placeholder for MongoDB during build (not used)
ENV MONGODB_URI=mongodb://placeholder:27017

# Build the application
RUN npm run build --no-lint

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set MongoDB URI directly in the container
ENV MONGODB_URI="mongodb+srv://jayantpatil:eNb9ARTLnrfnj9Zk@resume.fkh8x8n.mongodb.net/"
ENV JWT_SECRET="your-super-secret-jwt-key-2024"

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]