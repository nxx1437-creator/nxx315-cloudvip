import { supabase } from '../supabaseClient';

const CONFIG = {
  THRESHOLDS: {
    SAFE: 30,
    WARNING: 60,
    DANGER: 100
  },
  LIMITS: {
    DAILY_REDEEM: 3,
    MONTHLY_REDEEM: 10
  }
};

export class RiskEngine {
  // Tính risk score cho user
  static async calculateRisk(userId) {
    try {
      const { data, error } = await supabase
        .rpc('calculate_risk_score', { p_user_id: userId });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Risk calculation error:', error);
      return { score: 0, level: 'safe', details: {} };
    }
  }

  // Check redeem (hard check)
  static async canRedeem(userId) {
    try {
      const { data, error } = await supabase
        .rpc('check_redeem_eligibility', { p_user_id: userId });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Redeem check error:', error);
      return { allowed: false, reason: 'Lỗi hệ thống' };
    }
  }

  // Check task (soft check)
  static async canDoTask(userId) {
    const risk = await this.calculateRisk(userId);
    return {
      allowed: risk.level !== 'danger',
      risk
    };
  }

  // Log action
  static async logAction(userId, action, result, metadata = {}) {
    await supabase
      .from('fraud_logs')
      .insert({
        user_id: userId,
        action,
        result,
        metadata,
        device_id: localStorage.getItem('device_id'),
        fingerprint: localStorage.getItem('fingerprint'),
        ip: metadata.ip || null
      });
  }
}
