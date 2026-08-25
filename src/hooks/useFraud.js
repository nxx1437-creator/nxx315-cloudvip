import { useState, useEffect } from 'react';
import { RiskEngine } from '../lib/fraud/riskEngine';
import { supabase } from '../lib/supabaseClient.js';

// Hàm tạo fingerprint đơn giản
const generateFingerprint = () => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset()
  ];
  const str = components.join('|||');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

// Hàm lấy IP public
const getPublicIP = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
};

// Kiểm tra xem user có phải admin không
const checkIsAdmin = async (userId) => {
  if (!userId) return false;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    return data?.is_admin === true;
  } catch {
    return false;
  }
};

export const useFraud = (userId) => {
  const [fingerprint, setFingerprint] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ip, setIp] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Khởi tạo fingerprint
  useEffect(() => {
    const init = async () => {
      const fp = generateFingerprint();
      setFingerprint(fp);
      
      const publicIP = await getPublicIP();
      setIp(publicIP);
      
      // Kiểm tra admin
      if (userId) {
        const adminStatus = await checkIsAdmin(userId);
        setIsAdmin(adminStatus);
      }
      
      setLoading(false);
    };
    init();
  }, [userId]);

  // Tính risk khi có userId
  useEffect(() => {
    if (!userId) return;
    
    const checkRisk = async () => {
      try {
        const result = await RiskEngine.calculateRisk(userId);
        setRisk(result);
      } catch (error) {
        console.error('Risk check error:', error);
      }
    };
    
    checkRisk();
  }, [userId]);

  // Kiểm tra redeem - Admin bypass
  const checkRedeem = async () => {
    if (!userId) return { allowed: false, reason: 'Chưa đăng nhập' };
    
    // Admin được bypass toàn bộ
    if (isAdmin) {
      return { allowed: true, reason: '' };
    }
    
    try {
      return await RiskEngine.canRedeem(userId);
    } catch {
      return { allowed: false, reason: 'Lỗi hệ thống' };
    }
  };

  // Kiểm tra task - Admin bypass
  const checkTask = async () => {
    if (!userId) return { allowed: false, reason: 'Chưa đăng nhập' };
    
    // Admin được bypass toàn bộ
    if (isAdmin) {
      return { allowed: true, reason: '' };
    }
    
    try {
      return await RiskEngine.canDoTask(userId);
    } catch {
      return { allowed: false, reason: 'Lỗi hệ thống' };
    }
  };

  // Log action
  const logAction = async (action, result, metadata = {}) => {
    try {
      await RiskEngine.logAction(userId, action, result, {
        ...metadata,
        fingerprint,
        ip
      });
    } catch (error) {
      console.error('Log action error:', error);
    }
  };

  return {
    fingerprint,
    risk,
    loading,
    ip,
    isAdmin,
    checkRedeem,
    checkTask,
    logAction
  };
};

export default useFraud;
