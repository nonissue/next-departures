-- Counts after pruning
SELECT (SELECT COUNT(*) FROM stop_times) AS stop_times_rows,
       (SELECT COUNT(*) FROM stops)      AS stops_rows;
-- Orphan check (should be zero)
SELECT COUNT(*) AS orphans
FROM stop_times st LEFT JOIN stops s ON s.stop_id = st.stop_id
WHERE s.stop_id IS NULL;