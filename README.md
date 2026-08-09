# 🎁 EntreRegalos

Aplicación web privada para gestionar listas de regalos entre amigos.
Solo accesible mediante invitación del administrador.

## Stack tecnológico

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** NestJS + TypeScript + Prisma
- **Base de datos:** PostgreSQL
- **Infraestructura:** Docker + Docker Compose

## Arranque rápido

```bash
# Clonar el repositorio
git clone https://github.com/pablotecat/EntreRegalos.git
cd EntreRegalos

# Levantar todos los servicios
docker-compose up
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/v1

## Desarrollo local

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Documentación

Consulta la carpeta `docs/` para la especificación funcional, arquitectura y OpenAPI.