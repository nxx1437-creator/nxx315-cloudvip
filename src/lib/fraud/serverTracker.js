import { supabase } from '../supabaseClient';

export class ServerTracker {
  // Lưu tracking từ server
  static async trackDevice(userId, fingerprint) {
    // 1. Lưu vào database
    const { data, error } = await supabase
      .from('devices')
      .insert({
        user_id: userId,
        fingerprint: fingerprint,
        device_id: fingerprint.deviceId,
        permanent_id: fingerprint.permanentId, // 👈 Quan trọng
        fingerprint_components: fingerprint.components,
        ip: await this.getIP(),
        user_agent: navigator.userAgent,
        // 👇 Thêm thông tin tracking
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        timezone_offset: new Date().getTimezoneOffset(),
        browser_language: navigator.language,
        hardware_concurrency: navigator.hardwareConcurrency,
        device_memory: navigator.deviceMemory || 0
      });
    
    if (error) {
      console.error('Track device error:', error);
    }
    
    return data;
  }

  // 👇 Server-side cluster detection
  static async detectClusters(fingerprint) {
    // Dùng permanent_id để detect cluster
    const { data, error } = await supabase
      .from('devices')
      .select(`
        user_id,
        permanent_id,
        users!inner(
          id,
          username,
          email,
          created_at,
          verified_at,
          risk_level,
          risk_score
        )
      `)
      .eq('permanent_id', fingerprint.permanentId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Cluster detection error:', error);
      return [];
    }
    
    // 📌 Log cluster
    console.log(`🔍 Cluster detected: ${data?.length || 0} accounts`);
    data?.forEach((d, i) => {
      console.log(`  ${i+1}. ${d.users?.username} (${d.users?.email})`);
    });
    
    return data || [];
  }

  // 👇 Hard check: Block nếu cluster > 3
  static async checkRegistration(fingerprint) {
    const cluster = await this.detectClusters(fingerprint);
    
    if (cluster.length >= 5) {
      return {
        allowed: false,
        reason: `🚫 Phát hiện ${cluster.length} tài khoản trên cùng thiết bị. 
                 Vui lòng liên hệ hỗ trợ.`,
        cluster
      };
    }
    
    if (cluster.length >= 3) {
      return {
        allowed: true,
        warning: `⚠️ Phát hiện ${cluster.length} tài khoản. 
                  Tài khoản sẽ được đánh dấu theo dõi.`,
        cluster
      };
    }
    
    return { allowed: true };
  }

  static async getIP() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return null;
    }
  }
}
