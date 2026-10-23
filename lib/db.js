"use strict";

const { Pool } = require("pg");

let pool;
let schemaReady;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");

    // Local / Docker Postgres runs without SSL; hosted Postgres (Neon, etc.) needs it.
    const isLocal = /@(localhost|127\.0\.0\.1|db|postgres)(:\d+)?\//.test(connectionString);
    const hasSslMode = /[?&]sslmode=/.test(connectionString);

    pool = new Pool({
      connectionString,
      ssl: isLocal || hasSslMode ? undefined : { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS messages (
           id         SERIAL PRIMARY KEY,
           name       VARCHAR(120)  NOT NULL,
           email      VARCHAR(200)  NOT NULL,
           message    TEXT          NOT NULL,
           created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
         )`
      )
      .catch((err) => {
        schemaReady = undefined;
        throw err;
      });
  }
  return schemaReady;
}

async function saveMessage({ name, email, message }) {
  await ensureSchema();
  const { rows } = await getPool().query(
    "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING id, created_at",
    [name, email, message]
  );
  return rows[0];
}

module.exports = { getPool, ensureSchema, saveMessage };
