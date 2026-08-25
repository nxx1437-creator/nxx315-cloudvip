import { useState, useEffect } from 'react';
const getFingerprint = () => {
  return Math.random().toString(36).substring(2, 15);
};
import { RiskEngine } from '../lib/fraud/riskEngine';

export const useFraud = (userId) => {
  const [fingerprint, setFingerprint] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ip, setIp] = useState(null);

  // Khởi tạo fingerprint
  useEffect(() => {
    const init = async () => {
      const fp = await generateFingerprint();
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
      const result = await RiskEngine.calculateRisk(userId);
      setRisk(result);
    };
    
    checkRisk();
  }, [userId]);

  // Kiểm tra redeem
  const checkRedeem = async () => {
    if (!userId) return { allowed: false, reason: 'Chưa đăng nhập' };
    return await RiskEngine.canRedeem(userId);
  };

  // Kiểm tra task
  const checkTask = async () => {
    if (!userId) return { allowed: false, reason: 'Chưa đăng nhập' };
    return await RiskEngine.canDoTask(userId);
  };

  // Log action
  const logAction = async (action, result, metadata = {}) => {
    await RiskEngine.logAction(userId, action, result, {
      ...metadata,
      ip
    });
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
