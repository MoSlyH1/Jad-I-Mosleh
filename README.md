# Jad Imad Mosleh — Personal Website

Node.js + vanilla JavaScript, PostgreSQL, Docker, deployable on Vercel.

```
public/              Static site (index.html, styles.css, app.js, assets/)
api/contact.js       Vercel serverless function  →  POST /api/contact
lib/                 Shared code: Postgres pool + contact handler
local-server.js      Express server (Docker / local)
db/schema.sql        Postgres table for contact messages
Dockerfile           Web container
docker-compose.yml   Web + Postgres
vercel.json          Vercel config (serves /public, runs /api)
```

The only database table is `messages`, filled by the contact form. It is created automatically on first use.

## Run with Docker

```bash
docker compose up --build
```

Open http://localhost:3000. Read messages:

```bash
docker compose exec db psql -U jad -d portfolio -c "SELECT * FROM messages ORDER BY created_at DESC;"
```

## Run without Docker

```bash
npm install
cp .env.example .env          # point DATABASE_URL at any Postgres
export $(cat .env | xargs)
npm start
```

## Deploy on Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project →** import the repo. Framework preset: **Other**. Leave build command empty.
3. Create a Postgres database (Neon works — Vercel Marketplace or neon.tech) and copy its connection string.
4. In the Vercel project: **Settings → Environment Variables** → add `DATABASE_URL` = your connection string.
5. Deploy. The site is served from `public/`, the form posts to `/api/contact`.

Or from the CLI:

```bash
npm i -g vercel
vercel
vercel env add DATABASE_URL
vercel --prod
```

## Editing content

All text lives in `public/index.html`. Images are in `public/assets/img/`, the CV and books in `public/assets/files/`.
