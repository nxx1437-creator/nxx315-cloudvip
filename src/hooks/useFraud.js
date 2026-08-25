import { useState, useEffect } from 'react';
import { RiskEngine } from '../lib/fraud/riskEngine';

// Hàm tạo fingerprint đơn giản
const generateFingerprint = () => {
  // Không cần async/await vì là sync
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

// Hàm lấy IP public (nếu không có thì dùng fallback)
const getPublicIP = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
};

export const useFraud = (userId) => {
  const [fingerprint, setFingerprint] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ip, setIp] = useState(null);

  // Khởi tạo fingerprint
  useEffect(() => {
    const init = async () => {
      const fp = generateFingerprint(); // ❌ Bỏ await vì sync
      setFingerprint(fp);
      
      const publicIP = await getPublicIP();
      setIp(publicIP);
      
      setLoading(false);
    };
    init();
  }, []);

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

  // Kiểm tra redeem
  const checkRedeem = async () => {
    if (!userId) return { allowed: false, reason: 'Chưa đăng nhập' };
    try {
      return await RiskEngine.canRedeem(userId);
    } catch {
      return { allowed: false, reason: 'Lỗi hệ thống' };
    }
  };

  // Kiểm tra task
  const checkTask = async () => {
    if (!userId) return { allowed: false, reason: 'Chưa đăng nhập' };
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
    checkRedeem,
    checkTask,
    logAction
  };
};
