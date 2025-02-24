# Use Node.js as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --production

# Copy application code
COPY . .

# Add Datadog Node.js tracer
RUN npm install dd-trace --save

# Environment variables for Datadog
ENV DD_SERVICE="xforia-technologies"
ENV DD_ENV="production"
ENV DD_LOGS_INJECTION=true
ENV DD_TRACE_ENABLED=true
ENV DD_RUNTIME_METRICS_ENABLED=true

# Entry point script with Datadog initialization
CMD ["node", "-r", "dd-trace/init", "app.js"]
# Expose port 8080
EXPOSE 8080
