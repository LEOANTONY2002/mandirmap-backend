-- Fix Column Types
ALTER TABLE "Location" ALTER COLUMN coords TYPE geography(Point, 4326) USING coords::geography;
ALTER TABLE "Astrologer" ALTER COLUMN coords TYPE geography(Point, 4326) USING coords::geography;

-- Update Values
UPDATE "Location" SET coords = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;
UPDATE "Astrologer" SET coords = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;
