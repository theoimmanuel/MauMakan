-- Jalankan satu kali pada database dengan skema ERD lama.
-- Untuk database kosong, gunakan erd/mau_makan_apa_schema.sql saja.
BEGIN;
ALTER TABLE users ADD CONSTRAINT users_identity_check CHECK (
    (is_guest AND email IS NULL AND password_hash IS NULL)
    OR (NOT is_guest AND email IS NOT NULL AND btrim(email) <> ''
        AND password_hash IS NOT NULL AND btrim(password_hash) <> '')
);
CREATE UNIQUE INDEX users_email_case_insensitive ON users (lower(email));
CREATE TABLE auth_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  CHAR(64) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL,
    CONSTRAINT auth_sessions_expiry_check CHECK (expires_at > created_at)
);
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);
COMMIT;
