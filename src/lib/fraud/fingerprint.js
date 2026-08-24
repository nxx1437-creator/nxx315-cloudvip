// Generate device fingerprint từ browser
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
  const deviceId = localStorage.getItem('device_id') || crypto.randomUUID();
  
  if (!localStorage.getItem('device_id')) {
    localStorage.setItem('device_id', deviceId);
  }
  if (!localStorage.getItem('fingerprint')) {
    localStorage.setItem('fingerprint', hash);
  }
  
  return { fingerprint: hash, components, deviceId };
};

// Canvas fingerprint
const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('CloudVIP', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Rewards', 4, 17);
    return canvas.toDataURL();
  } catch {
    return 'canvas_error';
  }
};

// WebGL fingerprint
const getWebGLFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'webgl_not_supported';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'webgl_no_info';
    }
    return 'webgl_no_debug';
  } catch {
    return 'webgl_error';
  }
};

// Font fingerprint
const getFontFingerprint = () => {
  const fonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS'];
  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.fontSize = '72px';
  span.textContent = 'abcdefghijklmnopqrstuvwxyz';
  document.body.appendChild(span);
  const baseWidth = span.offsetWidth;
  const available = fonts.filter(font => {
    span.style.fontFamily = `'${font}', sans-serif`;
    return span.offsetWidth !== baseWidth;
  });
  document.body.removeChild(span);
  return available.join(',');
};

// SHA256
const sha256 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Lấy IP public
export const getPublicIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return null;
  }
};
