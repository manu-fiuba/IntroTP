.PHONY: up down up-back up-front down-back down-front reset-back reset-front db-terminal logs reset reset-all

-include .env
export

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

# Apaga SOLO el backend
down-back:
	docker-compose down backend

# Apaga SOLO el frontend
down-front:
	docker-compose down frontend

# Apaga y crea nuevamente el back
reset-back: down-back up-back

# Apaga y crea nuevamente el frontend
reset-front: down-front up-front

# Terminal base de datos
db-terminal:
	docker exec -it f2fantasy_db psql -U postgres $(DB_NAME)

# Muestra los logs del backend
logs:
	docker compose logs -f backend

# Apaga y crea nuevamente todo (mantiene el volumen de la DB)
reset: down up

# Borra la base de datos de cero y vuelve a correr el init.sql
reset-all:
	docker compose down -v
	docker compose up -d --build
