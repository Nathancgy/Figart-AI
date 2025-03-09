FROM nginx:alpine

# Install the uWSGI module for Nginx
RUN apk add --no-cache nginx-mod-http-uwsgi

# Copy the frontend files to the Nginx HTML directory
COPY . /usr/share/nginx/html/

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 