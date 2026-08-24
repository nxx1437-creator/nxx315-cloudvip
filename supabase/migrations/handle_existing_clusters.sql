-- 2. Cập nhật risk_score cho tất cả user trong cluster
CREATE OR REPLACE FUNCTION update_risk_for_existing_clusters()
RETURNS TABLE(
  fingerprint TEXT,
  updated_count INT,
  risk_level TEXT
) AS $$
DECLARE
  v_cluster RECORD;
  v_risk_score INT;
  v_risk_level TEXT;
  v_updated_count INT;
BEGIN
  FOR v_cluster IN (
    SELECT 
      d.fingerprint,
      COUNT(DISTINCT d.user_id) as account_count,
      array_agg(DISTINCT d.user_id) as user_ids
    FROM devices d
    WHERE d.fingerprint IS NOT NULL
    GROUP BY d.fingerprint
    HAVING COUNT(DISTINCT d.user_id) > 1
  ) LOOP
    -- Tính risk dựa trên cluster size
    v_risk_score := 0;
    
    IF v_cluster.account_count >= 5 THEN
      v_risk_score := 80;
      v_risk_level := 'danger';
    ELSIF v_cluster.account_count >= 3 THEN
      v_risk_score := 50;
      v_risk_level := 'warning';
    ELSE
      v_risk_score := 20;
      v_risk_level := 'safe';
    END IF;
    
    -- Cập nhật tất cả user trong cluster
    UPDATE users 
    SET 
      risk_score = v_risk_score,
      risk_level = v_risk_level,
      flagged_at = CASE 
        WHEN v_risk_level = 'danger' THEN NOW()
        ELSE flagged_at
      END
    WHERE id = ANY(v_cluster.user_ids);
    
    v_updated_count := array_length(v_cluster.user_ids, 1);
    
    -- Log
    INSERT INTO fraud_logs (
      user_id,
      action,
      result,
      metadata,
      created_at
    )
    SELECT 
      unnest(v_cluster.user_ids),
      'cluster_scan',
      v_risk_level,
      jsonb_build_object(
        'cluster_size', v_cluster.account_count,
        'fingerprint', v_cluster.fingerprint,
        'action', 'auto_update'
      ),
      NOW();
    
    fingerprint := v_cluster.fingerprint;
    updated_count := v_updated_count;
    risk_level := v_risk_level;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
