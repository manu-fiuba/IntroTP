.PHONY: up down up-back up-front logs reset-db

# Levanta todo el proyecto (Base de datos, Backend y Frontend)
up:
	docker compose up -d --build

# Apaga todo el proyecto (no se borra el volumen)
down:
	docker compose down

# Levanta SOLO el backend (junto con la base de datos)
up-back:
	docker-compose up -d --build backend

# Levanta SOLO el frontend
up-front:
	docker-compose up -d --build frontend

# Muestra los logs del backend
logs:
	docker compose logs -f backend

# Borra la base de datos de cero y vuelve a correr el init.sql
reset-db:
	docker compose down -v
	docker compose up -d --build
