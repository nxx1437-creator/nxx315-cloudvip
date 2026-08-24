import { supabase } from '../supabaseClient';

export class ClusterManager {
  // Kiểm tra fingerprint đã tồn tại trong DB chưa
  static async checkFingerprintExists(fingerprint) {
    const { data, error } = await supabase
      .from('devices')
      .select('user_id, users!inner(username, email)')
      .eq('fingerprint', fingerprint)
      .limit(10);
    
    if (error) {
      console.error('Check fingerprint error:', error);
      return [];
    }
    
    return data || [];
  }

  // Đếm số account dùng chung fingerprint
  static async getClusterSize(fingerprint) {
    const { count, error } = await supabase
      .from('devices')
      .select('*', { count: 'exact', head: true })
      .eq('fingerprint', fingerprint);
    
    if (error) return 0;
    return count || 0;
  }

  // Phát hiện suspicious
  static async isSuspicious(fingerprint) {
    const count = await this.getClusterSize(fingerprint);
    return count >= 3; // >= 3 accounts cùng fingerprint
  }

  // Lấy tất cả user trong cluster
  static async getClusterMembers(fingerprint) {
    const { data, error } = await supabase
      .from('devices')
      .select(`
        user_id,
        users!inner(
          id,
          username,
          email,
          created_at,
          verified_at
        )
      `)
      .eq('fingerprint', fingerprint)
      .order('created_at', { ascending: true });
    
    if (error) return [];
    return data || [];
  }
}
