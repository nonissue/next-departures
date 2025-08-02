-- Before:
-- 513M	  db/gtfs.db
-- 20M	  gtfs_lrt_only.db


-- Either:
-- sqlite3 path/to/gtfs.db ".read prune_lrt.sql"
-- sqlite3 db/gtfs.db ".read prune_lrt.sql"

-- Or:
-- sqlite3 path/to/gtfs.db < prune_lrt.sql

-- ===== Keep only light rail (route_type = 0) and the stops they use =====
SAVEPOINT lrt_prune;

-- 1) Keep only trips on LRT routes
DELETE FROM trips
WHERE route_id NOT IN (
  SELECT r.route_id
  FROM routes r
  WHERE r.route_type = 0
);

-- 2) Keep only stop_times for remaining trips
DELETE FROM stop_times
WHERE trip_id NOT IN (SELECT trip_id FROM trips);

-- 3) Keep only stops referenced by the remaining stop_times, plus their parents
CREATE TEMP TABLE used_stop_ids AS
SELECT DISTINCT st.stop_id
FROM stop_times st;

CREATE TEMP TABLE parent_ids AS
SELECT DISTINCT s.parent_station AS stop_id
FROM stops s
JOIN used_stop_ids u ON u.stop_id = s.stop_id
WHERE s.parent_station IS NOT NULL;

CREATE TEMP TABLE keep_stop_ids AS
SELECT stop_id FROM used_stop_ids
UNION
SELECT stop_id FROM parent_ids;

DELETE FROM stops
WHERE stop_id NOT IN (SELECT stop_id FROM keep_stop_ids);

DROP TABLE used_stop_ids;
DROP TABLE parent_ids;
DROP TABLE keep_stop_ids;

-- 4) (Optional) Drop tables you no longer need in the app
--    If you only query stops + stop_times at runtime, these can go:
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS calendar;
DROP TABLE IF EXISTS calendar_dates;
DROP TABLE IF EXISTS shapes;
DROP TABLE IF EXISTS transfers;
DROP TABLE IF EXISTS fare_attributes;
DROP TABLE IF EXISTS fare_rules;
DROP TABLE IF EXISTS attributions;
DROP TABLE IF EXISTS agency;
DROP TABLE IF EXISTS feed_info;
DROP TABLE IF EXISTS pathways;
DROP TABLE IF EXISTS levels;
DROP TABLE IF EXISTS translations;

RELEASE SAVEPOINT lrt_prune;

-- 5) Tighten & speed up
PRAGMA wal_checkpoint(FULL);

VACUUM INTO 'db/gtfs_lrt_only.db';
-- OR:
-- VACUUM;

ANALYZE;

-- 6) Helpful indexes for your queries
CREATE INDEX IF NOT EXISTS idx_stop_times_stop_id ON stop_times(stop_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_trip_id ON stop_times(trip_id);
