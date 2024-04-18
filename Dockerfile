# Use the official lightweight Node.js 14 image.
# https://hub.docker.com/_/node
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Argument for environment with a default value
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Copy package.json and package-lock.json to work directory
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy local code to the container
COPY . .

# Generate Prisma Client. This step ensures that the client is generated
# for the environment specified by the base image.
RUN npx prisma generate

# Build the Next.js application
RUN if [ "$NODE_ENV" = "production" ] || [ "$NODE_ENV" = "test" ]; then npm run build; else echo "Skipping build for development"; fi

# Inform Docker that the container is listening on port 3000
EXPOSE 3000

# Run the web service on container startup.
# Use a conditional command to switch between development and production mode.
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"development\" ]; then npm run dev; else npm run start; fi"]
