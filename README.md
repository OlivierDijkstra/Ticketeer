# TicketGate Monorepo

TicketGate is a monorepo solution designed for a simple ticketing application. It includes a Laravel API, a Next.js dashboard for administration, and a Next.js frontend for ticket purchasing. This setup allows for easy forking and deployment, making it a versatile choice for various ticketing needs.

## Features

- **Laravel API**: Handles backend operations and data management.
- **Next.js Dashboard**: Provides an admin interface for managing events, tickets, and users.
- **Next.js Frontend**: User-facing application for browsing and purchasing tickets.

## Architecture

TicketGate is structured as a monorepo using Turborepo, which allows for efficient management of multiple projects within a single repository. The monorepo includes:

- **Laravel API**: Backend operations and data management.
- **Next.js Dashboard**: Admin interface for managing events, tickets, and users.
- **Next.js Frontend**: User-facing application for browsing and purchasing tickets.

### Turborepo

Turborepo is used to manage and build the different applications within the monorepo. It provides a streamlined way to handle dependencies, build processes, and scripts across multiple projects.

### Docker

Docker is used to containerize the applications, ensuring consistent environments for development and production. The repository includes Docker Compose files for both development and production environments.

### Customization

Users are free to configure the monorepo to suit their development needs. Environment variables can be adjusted by modifying the [.env]() files for each application. The [Makefile]() provides convenient targets for common tasks such as building, starting, and stopping containers.

## Getting Started

To get started with TicketGate, follow these setup instructions for each component of the monorepo.

### Prerequisites

- Docker
- Docker Compose
- Node.js (>=18)
- Yarn

### Setup Instructions

1. **Clone the Repository:**

   ```sh
   git clone https://github.com/your-repo/ticketgate-monorepo.git
   cd ticketgate-monorepo
   ```

2. **Install Dependencies:**

   ```sh
   yarn install
   ```

3. **Configure Environment Variables:**
   Copy the example environment files and adjust them if necessary.

   ```sh
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/dashboard/.env.example apps/dashboard/.env
   ```

4. **Build and Start the Containers:**
   For development:

   ```sh
   make dev
   ```

   For production:

   ```sh
   make prod
   ```

5. **Stop and Remove Containers:**
   ```sh
   make down
   ```

### Makefile Targets

- `make prod`: Build and start the production containers.
- `make dev`: Build and start the development containers.
- `make down`: Stop and remove all containers.

### Additional Commands

- **Run Tests:**

  ```sh
  yarn test
  ```

- **Lint Code:**

  ```sh
  yarn lint
  ```

- **Format Code:**
  ```sh
  yarn format
  ```

This should be enough to get the application up and running. For more detailed configuration, refer to the individual app documentation.
