# Use an official PHP runtime as a parent image
FROM php:8.3-cli-alpine

# Set the working directory in the container
WORKDIR /var/www/html

# Copy the current directory contents into the container at /var/www/html
COPY apps/api .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run php artisan serve when the container launches
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]