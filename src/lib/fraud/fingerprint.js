// 🔥 SUPER FINGERPRINT - Không thể reset bằng xóa cookie
export const generateSuperFingerprint = async () => {
  // 1. Lấy các hardware identifiers
  const hardwareIds = {
    // 👇 QUAN TRỌNG: Các ID này khó thay đổi
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory || 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    
    // 2. Canvas fingerprint - rất khó fake
    canvas: getCanvasFingerprint(),
    
    // 3. WebGL fingerprint - unique
    webgl: getWebGLFingerprint(),
    
    // 4. Font fingerprint
    fonts: getFontFingerprint(),
    
    // 5. Audio fingerprint (thêm mới)
    audio: getAudioFingerprint(),
    
    // 6. GPU fingerprint (thêm mới)
    gpu: getGPUFingerprint(),
    
    // 7. Screen properties
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    
    // 8. Touch support
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // 9. Plugins list
    plugins: Array.from(navigator.plugins || []).map(p => p.name).join(','),
    
    // 10. 👇 QUAN TRỌNG NHẤT: Tạo ID từ nhiều nguồn
    // Không thể reset bằng xóa cookie/localStorage
    permanentId: generatePermanentId()
  };
  
  const hash = await sha256(JSON.stringify(hardwareIds));
  
  // 👇 KHÔNG dùng localStorage nữa, dùng sessionStorage + nhiều nguồn
  let deviceId = sessionStorage.getItem('super_device_id');
  if (!deviceId) {
    // Tạo từ hardware ID + random seed cố định
    deviceId = await sha256(hash + navigator.userAgent + window.screen.width);
    sessionStorage.setItem('super_device_id', deviceId);
  }
  
  // 📌 Log để debug
  console.log('🔒 Super Fingerprint:', {
    deviceId: deviceId.substring(0, 20) + '...',
    hash: hash.substring(0, 20) + '...',
    components: Object.keys(hardwareIds)
  });
  
  return { 
    fingerprint: hash, 
    deviceId, 
    components: hardwareIds,
    permanentId: hardwareIds.permanentId 
  };
};

// 👇 Permanent ID từ nhiều nguồn
function generatePermanentId() {
  // Kết hợp nhiều nguồn để tạo ID bền vững
  const sources = [
    navigator.userAgent,
    navigator.platform,
    window.screen.width + 'x' + window.screen.height,
    navigator.hardwareConcurrency,
    navigator.deviceMemory || 0,
    new Date().getTimezoneOffset(),
    navigator.language,
    // Thêm canvas hash vào
    getCanvasFingerprint().substring(0, 100)
  ];
  
  // Tạo hash từ các nguồn
  let combined = sources.join('||');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// 👇 Audio fingerprint (thêm mới)
function getAudioFingerprint() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    oscillator.connect(analyser);
    oscillator.frequency.value = 440;
    oscillator.type = 'sawtooth';
    oscillator.start(0);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    oscillator.stop();
    audioContext.close();
    
    return Array.from(dataArray.slice(0, 50)).join(',');
  } catch {
    return 'audio_not_supported';
  }
}

// 👇 GPU fingerprint (thêm mới)
function getGPUFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'webgl_not_supported';
    
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
      return `${vendor}||${renderer}`;
    }
    
    // Fallback: get shader info
    const shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, 'void main() { gl_FragColor = vec4(1.0); }');
    gl.compileShader(shader);
    const info = gl.getShaderInfoLog(shader);
    return info || 'webgl_no_info';
  } catch {
    return 'webgl_error';
  }
}
