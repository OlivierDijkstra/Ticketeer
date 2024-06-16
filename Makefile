# Define the default target to avoid errors when running `make` without a target
.DEFAULT_GOAL := help

# Help command to display the available make commands
help:
	@echo "Usage: make [target]"
	@echo
	@echo "Targets:"
	@echo "  prod     Build and start the production containers"
	@echo "  dev      Build and start the development containers"
	@echo "  down           Stop and remove all containers"

# Command to build and start the production containers
prod:
	docker-compose up --build -d

# Command to build and start the development containers
dev:
	docker-compose -f docker-compose.dev.yml up -d --build
	yarn dev

# Command to stop and remove all containers
down:
	docker-compose down
