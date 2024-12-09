# Use an official Node.js runtime as the base image
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Use a lightweight web server to serve the static files
FROM nginx:alpine

# Remove default nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration file
COPY nginx.conf /etc/nginx/conf.d

# Copy the built files from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose the necessary ports
EXPOSE 11180
EXPOSE 80

# Env variables
ENV RABBITMQ_HOSTNAME=rabbitmq_hostname
ENV RABBITMQ_PORT=rabbitmq_port
ENV RABBITMQ_USERNAME=rabbitmq_username
ENV RABBITMQ_PASSWORD=rabbitmq_password
ENV MONGODB_CONNECTION_STRING=mongodb_connection_string

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
