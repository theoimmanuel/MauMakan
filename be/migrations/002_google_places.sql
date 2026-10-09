BEGIN;
-- Store Google Place IDs only; fetch display content fresh for each search.
-- Preserve independently maintained place data and food relations.
ALTER TABLE places ALTER COLUMN name DROP NOT NULL;
CREATE UNIQUE INDEX places_google_place_id_unique ON places (google_place_id);
COMMIT;
