UPDATE "Location" SET coords = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;
UPDATE "Astrologer" SET coords = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;
