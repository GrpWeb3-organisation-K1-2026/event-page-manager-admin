# Event Page Manager

Application Next.js de gestion d'événements avec sessions, speakers et questions.

## Installation

```bash
npm install
```

## Configuration

Copiez `.env.example` en `.env` et renseignez votre URL PostgreSQL :

```bash
cp .env.example .env
```

## Base de données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy
```

## Démarrage

```bash
npm run dev
```

## API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/events` | Liste des événements |
| POST | `/api/events` | Créer un événement |
| GET | `/api/events/:id` | Détail d'un événement |
| PATCH | `/api/events/:id` | Modifier un événement |
| DELETE | `/api/events/:id` | Supprimer un événement |
| GET | `/api/sessions` | Liste des sessions (`?eventId=&roomId=&page=&limit=`) |
| POST | `/api/sessions` | Créer une session |
| GET | `/api/sessions/:id` | Détail d'une session |
| PATCH | `/api/sessions/:id` | Modifier une session |
| DELETE | `/api/sessions/:id` | Supprimer une session |
