import { supabase } from '../supabaseClient';
import { ClusterManager } from './clusterManager';

const CONFIG = {
  THRESHOLDS: {
    SAFE: 30,
    WARNING: 60,
    DANGER: 100
  }
};

export class RiskEngine {
  static async calculateRisk(userId) {
    try {
      // 1. Lấy fingerprint của user
      const { data: device } = await supabase
        .from('devices')
        .select('fingerprint, device_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!device) {
        return { score: 0, level: 'safe', details: { message: 'No device found' } };
      }

      // 2. Đếm số device của user
      const { count: deviceCount } = await supabase
        .from('devices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // 3. Đếm cluster size (cùng fingerprint)
      const { count: clusterSize } = await supabase
        .from('devices')
        .select('*', { count: 'exact', head: true })
        .eq('fingerprint', device.fingerprint);

      // 4. Lấy danh sách các account trong cluster
      const clusterAccounts = await ClusterManager.getClusterMembers(device.fingerprint);

      // 5. Tính risk score
      let score = 0;

      // Nhiều device
      if (deviceCount > 3) {
        score += (deviceCount - 3) * 8;
      }

      // Cluster có nhiều account
      if (clusterSize > 3) {
        score += (clusterSize - 3) * 10;
        
        // Bonus: Nếu >5 account trong cluster → tăng mạnh
        if (clusterSize > 5) {
          score += 20;
        }
      }

      // Kiểm tra các account trong cluster có bị flag không
      const flaggedAccounts = clusterAccounts.filter(
        acc => acc.users?.verified_at === null
      );
      if (flaggedAccounts.length > 2) {
        score += flaggedAccounts.length * 5;
      }

      // Giới hạn 0-100
      score = Math.min(Math.max(score, 0), 100);

      const level = score <= CONFIG.THRESHOLDS.SAFE ? 'safe' :
                    score <= CONFIG.THRESHOLDS.WARNING ? 'warning' : 'danger';

      // 📌 Log cluster info để debug
      console.log(`📊 Cluster Analysis:`, {
        fingerprint: device.fingerprint.substring(0, 20) + '...',
        clusterSize,
        deviceCount,
        score,
        level,
        accounts: clusterAccounts.map(a => a.users?.username || 'unknown')
      });

      // Lưu vào database
      await supabase
        .from('users')
        .update({ 
          risk_score: score, 
          risk_level: level 
        })
        .eq('id', userId);

      return {
        score,
        level,
        details: {
          deviceCount,
          clusterSize,
          clusterAccounts: clusterAccounts.map(a => ({
            id: a.user_id,
            username: a.users?.username || 'unknown',
            created_at: a.users?.created_at
          }))
        }
      };
    } catch (error) {
      console.error('Risk calculation error:', error);
      return { score: 0, level: 'safe', details: { error: error.message } };
    }
  }

  static async checkRedeem(userId) {
    const risk = await this.calculateRisk(userId);
    
    // Hard check
    if (risk.details.clusterSize > 5) {
      return {
        allowed: false,
        reason: `Phát hiện ${risk.details.clusterSize} tài khoản cùng thiết bị`,
        risk
      };
    }

    if (risk.level === 'danger') {
      return {
        allowed: false,
        reason: 'Tài khoản có dấu hiệu bất thường',
        risk
      };
    }

    // Check verified
    const { data: user } = await supabase
      .from('users')
      .select('verified_at')
      .eq('id', userId)
      .single();

    if (!user?.verified_at) {
      return {
        allowed: false,
        reason: 'Cần xác minh tài khoản',
        risk
      };
    }

    return { allowed: true, risk };
  }
        }
