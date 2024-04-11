# Use the official lightweight Node.js 14 image.
# https://hub.docker.com/_/node
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Argument for environment with a default value
ARG NODE_ENV=development

# Copy package.json and package-lock.json to work directory
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy your Prisma schema file to the Docker image
COPY prisma/schema.prisma ./prisma/

# Install Prisma CLI as a development dependency
RUN npm install @prisma/cli --save-dev

# Generate Prisma Client. This step ensures that the client is generated
# for the environment specified by the base image.
RUN npx prisma generate

# Copy local code to the container
COPY . .

# Build the Next.js application
RUN npm run build

# Inform Docker that the container is listening on port 3000
EXPOSE 3000

# Run the web service on container startup.
# Use a conditional command to switch between development and production mode.
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"development\" ]; then npm run dev; else npm run start; fi"]
