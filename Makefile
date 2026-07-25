.PHONY: dev dev-down up up-build down logs restart psql db-reset clean status build lint typecheck

# Dev (postgres + adminer)
dev:
	docker compose -f docker-compose.dev.yml up -d
	@echo "\n✓ Postgres ready at localhost:5432 | Adminer at localhost:8080"

dev-down:
	docker compose -f docker-compose.dev.yml down

# Production (server + client)
up:
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

# Compose: dev + prod together
up-all:
	docker compose -f docker-compose.dev.yml -f docker-compose.yml up -d

down-all:
	docker compose -f docker-compose.dev.yml -f docker-compose.yml down

# Logs
logs:
	docker compose logs -f

logs-server:
	docker compose logs -f server

logs-client:
	docker compose logs -f client

# Restart
restart:
	docker compose restart

restart-server:
	docker compose restart server

restart-client:
	docker compose restart client

# Database
psql:
	docker compose -f docker-compose.dev.yml exec postgres psql -U kazan -d kazan

db-reset:
	docker compose -f docker-compose.dev.yml down -v
	docker compose -f docker-compose.dev.yml up -d
	@echo "✓ Database reset complete"

# Build
build:
	docker compose build

build-nocache:
	docker compose build --no-cache

# Cleanup
clean:
	docker compose -f docker-compose.dev.yml down -v --remove-orphans
	docker compose down -v --remove-orphans
	@echo "✓ All containers, volumes, and orphans removed"

# Status
status:
	docker compose ps -a
	@echo ""
	docker compose -f docker-compose.dev.yml ps -a

# App (npm)
lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm test
