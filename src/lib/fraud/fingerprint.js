// Generate device fingerprint - CHỈ TẠO 1 LẦN DUY NHẤT
export const generateFingerprint = async () => {
  const components = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: navigator.deviceMemory || 0,
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    fonts: getFontFingerprint()
  };
  
  const hash = await sha256(JSON.stringify(components));
  
  // 🔥 QUAN TRỌNG: Kiểm tra đã có fingerprint trong localStorage chưa
  let deviceId = localStorage.getItem('device_id');
  let fingerprint = localStorage.getItem('fingerprint');
  
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  
  if (!fingerprint) {
    fingerprint = hash;
    localStorage.setItem('fingerprint', fingerprint);
  }
  
  // 📌 Log để debug
  console.log('📱 Device Info:', {
    deviceId,
    fingerprint: fingerprint.substring(0, 20) + '...',
    isNew: !localStorage.getItem('fingerprint_created')
  });
  
  // Đánh dấu đã tạo
  if (!localStorage.getItem('fingerprint_created')) {
    localStorage.setItem('fingerprint_created', 'true');
  }
  
  return { fingerprint, components, deviceId };
};
