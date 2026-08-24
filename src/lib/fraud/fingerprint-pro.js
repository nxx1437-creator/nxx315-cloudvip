import FingerprintJS from '@fingerprintjs/fingerprintjs';

// 👇 Dùng library chuyên nghiệp
export const getProfessionalFingerprint = async () => {
  // Khởi tạo FingerprintJS
  const fp = await FingerprintJS.load();
  
  // Get visitor identifier
  const result = await fp.get();
  
  // 👇 QUAN TRỌNG: visitorId là unique và bền vững
  const visitorId = result.visitorId;
  const components = result.components;
  
  // Lưu vào sessionStorage (không phải localStorage)
  let deviceId = sessionStorage.getItem('fpjs_device_id');
  if (!deviceId) {
    deviceId = visitorId;
    sessionStorage.setItem('fpjs_device_id', deviceId);
  }
  
  console.log('🆔 Professional Fingerprint:', {
    visitorId: visitorId.substring(0, 20) + '...',
    components: Object.keys(components)
  });
  
  return {
    fingerprint: visitorId,
    deviceId: visitorId,
    components: components,
    confidence: result.confidence
  };
};
