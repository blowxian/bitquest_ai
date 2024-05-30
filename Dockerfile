# Use the official lightweight Node.js 18 image.
FROM node:18 as builder

# Set the working directory in the container
WORKDIR /app

# Argument for environment with a default value
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Copy package.json and package-lock.json to work directory
COPY package*.json ./
COPY prisma ./prisma/

RUN npm cache clean --force

# Install dependencies
RUN npm install

# Copy local code to the container
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm run build && ls -la .next; \
    fi

# 第二阶段：专门为生产环境准备
FROM node:18 as production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]

# 第三阶段：专门为开发环境准备
FROM node:18 as development
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "dev"]