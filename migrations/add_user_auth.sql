-- Migration: add_user_auth
-- Run this in the Supabase SQL editor (or psql) once.
-- Safe to re-run — all statements use IF NOT EXISTS / IF EXISTS guards.

-- ── Users table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookup during login.
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- ── Link invitations to users (nullable — anonymous invites stay valid) ──────
ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Index for fast dashboard queries.
CREATE INDEX IF NOT EXISTS invitations_user_id_idx ON invitations (user_id);
