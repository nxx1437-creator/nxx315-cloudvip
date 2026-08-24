-- 1. Tìm tất cả cluster (các account dùng chung fingerprint)
CREATE OR REPLACE FUNCTION scan_existing_clusters()
RETURNS TABLE(
  fingerprint TEXT,
  account_count BIGINT,
  accounts JSONB,
  created_at_min TIMESTAMP,
  is_suspicious BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH cluster_data AS (
    SELECT 
      d.fingerprint,
      COUNT(DISTINCT d.user_id) as account_count,
      jsonb_agg(
        jsonb_build_object(
          'user_id', u.id,
          'username', u.username,
          'email', u.email,
          'created_at', u.created_at,
          'verified_at', u.verified_at,
          'risk_score', u.risk_score,
          'risk_level', u.risk_level
        )
      ) as accounts,
      MIN(u.created_at) as created_at_min
    FROM devices d
    JOIN users u ON u.id = d.user_id
    WHERE d.fingerprint IS NOT NULL
    GROUP BY d.fingerprint
    HAVING COUNT(DISTINCT d.user_id) > 1
  )
  SELECT 
    fingerprint,
    account_count,
    accounts,
    created_at_min,
    CASE 
      WHEN account_count >= 5 THEN true
      WHEN account_count >= 3 THEN true
      ELSE false
    END as is_suspicious
  FROM cluster_data
  ORDER BY account_count DESC;
END;
$$ LANGUAGE plpgsql;
