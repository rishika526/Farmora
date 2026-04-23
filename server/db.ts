process.loadEnvFile?.(".env");

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

const tutorialVideoBackfill = `
  CASE id
    WHEN 't1' THEN 'https://www.youtube.com/watch?v=LKAUY31_q_s'
    WHEN 't2' THEN 'https://youtu.be/VjxKkm9khJk'
    WHEN 't3' THEN 'https://www.youtube.com/embed/uAMniWJm2vo'
    WHEN 't4' THEN 'https://www.youtube.com/watch?v=EH6IBAsNZPE'
    WHEN 't5' THEN 'https://youtu.be/Jtw7pnqFeS4'
    WHEN 't6' THEN 'https://www.youtube.com/embed/RY432YI7SoE'
    WHEN 't7' THEN 'https://www.youtube.com/shorts/tZJpo5N28zc'
    WHEN 't8' THEN 'https://www.youtube.com/watch?v=Z5ozNM-Hb0w'
    ELSE video_url
  END
`;

let schemaEnsured = false;

export async function ensureDatabaseStructure() {
  if (schemaEnsured) return;

  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tutorials (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      thumbnail TEXT NOT NULL,
      video_url TEXT,
      category TEXT NOT NULL,
      duration TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      creator TEXT NOT NULL,
      tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      description TEXT,
      language TEXT NOT NULL DEFAULT 'English',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS kits (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      price REAL NOT NULL,
      rating REAL NOT NULL DEFAULT 0,
      reviews INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      is_affiliate BOOLEAN NOT NULL DEFAULT FALSE,
      commission REAL NOT NULL DEFAULT 0,
      tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS creators (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      avatar TEXT,
      engagement_score REAL NOT NULL DEFAULT 0,
      total_views INTEGER NOT NULL DEFAULT 0,
      tutorial_count INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      is_new BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS quantum_logs (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      endpoint TEXT NOT NULL,
      input_params JSONB,
      result JSONB,
      solver_used TEXT NOT NULL,
      execution_time_ms INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`ALTER TABLE tutorials ADD COLUMN IF NOT EXISTS video_url TEXT;`);
  await pool.query(`ALTER TABLE tutorials ADD COLUMN IF NOT EXISTS language TEXT;`);
  await pool.query(`UPDATE tutorials SET language = 'English' WHERE language IS NULL;`);
  await pool.query(`ALTER TABLE tutorials ALTER COLUMN language SET DEFAULT 'English';`);
  await pool.query(`ALTER TABLE tutorials ALTER COLUMN language SET NOT NULL;`);
  await pool.query(`UPDATE tutorials SET video_url = ${tutorialVideoBackfill} WHERE video_url IS NULL;`);

  await pool.query(`CREATE INDEX IF NOT EXISTS tutorials_created_at_idx ON tutorials (created_at DESC);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS tutorials_creator_idx ON tutorials (creator);`);

  schemaEnsured = true;
}
