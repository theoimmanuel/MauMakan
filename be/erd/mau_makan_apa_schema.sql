-- =========================================================
-- Skema Database: Mau Makan Apa? (Food Decision App)
-- Dialect: PostgreSQL
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- untuk gen_random_uuid()

-- ---------------------------------------------------------
-- USERS
-- ---------------------------------------------------------
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100),
    email         VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255),
    is_guest      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- FOODS
-- ---------------------------------------------------------
CREATE TABLE foods (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    category    VARCHAR(100),      -- mis. "nasi", "mie", "dessert"
    mood_tag    VARCHAR(100),      -- mis. "pedas", "hangat", "ringan"
    price_min   INTEGER,
    price_max   INTEGER,
    image_url   VARCHAR(255),
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- PLACES
-- ---------------------------------------------------------
CREATE TABLE places (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(150) NOT NULL,
    address          TEXT,
    latitude         DOUBLE PRECISION,
    longitude        DOUBLE PRECISION,
    google_place_id  VARCHAR(255),
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- FOOD_PLACES (junction: makanan tersedia di tempat mana, harga berapa)
-- ---------------------------------------------------------
CREATE TABLE food_places (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id  UUID NOT NULL REFERENCES foods(id)  ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    price    INTEGER,
    UNIQUE (food_id, place_id)
);

-- ---------------------------------------------------------
-- SESSIONS (satu kali input preferensi user)
-- ---------------------------------------------------------
CREATE TABLE sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL, -- nullable utk guest
    budget_min    INTEGER,
    budget_max    INTEGER,
    food_type     VARCHAR(100),
    mood          VARCHAR(100),
    location_lat  DOUBLE PRECISION,
    location_lng  DOUBLE PRECISION,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- SWIPES (hasil swipe skip/like per sesi)
-- ---------------------------------------------------------
CREATE TABLE swipes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    food_id    UUID NOT NULL REFERENCES foods(id)    ON DELETE CASCADE,
    action     VARCHAR(10) NOT NULL CHECK (action IN ('like', 'skip')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- FAVORITES
-- ---------------------------------------------------------
CREATE TABLE favorites (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id    UUID NOT NULL REFERENCES foods(id)  ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, food_id)
);

-- ---------------------------------------------------------
-- HISTORY (rekam jejak makanan yang akhirnya dipilih)
-- ---------------------------------------------------------
CREATE TABLE history (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    food_id    UUID NOT NULL REFERENCES foods(id)  ON DELETE CASCADE,
    place_id   UUID REFERENCES places(id)          ON DELETE SET NULL,
    chosen_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- Index tambahan untuk query yang sering dipakai
-- ---------------------------------------------------------
CREATE INDEX idx_sessions_user_id   ON sessions(user_id);
CREATE INDEX idx_swipes_session_id  ON swipes(session_id);
CREATE INDEX idx_swipes_food_id     ON swipes(food_id);
CREATE INDEX idx_food_places_food   ON food_places(food_id);
CREATE INDEX idx_food_places_place  ON food_places(place_id);
CREATE INDEX idx_favorites_user_id  ON favorites(user_id);
CREATE INDEX idx_history_user_id    ON history(user_id);
