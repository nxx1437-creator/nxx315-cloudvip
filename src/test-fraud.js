import { generateFingerprint } from './lib/fraud/fingerprint.js';

// Test 1: Generate fingerprint
async function testFingerprint() {
  console.log('🔍 Test 1: Generate fingerprint');
  const fp = await generateFingerprint();
  console.log('Device ID:', fp.deviceId);
  console.log('Fingerprint:', fp.fingerprint.substring(0, 50) + '...');
  console.log('Components:', Object.keys(fp.components));
  console.log('✅ Fingerprint generated successfully!\n');
}

// Test 2: Kiểm tra localStorage
function testLocalStorage() {
  console.log('🔍 Test 2: Check localStorage');
  const deviceId = localStorage.getItem('device_id');
  const fingerprint = localStorage.getItem('fingerprint');
  console.log('device_id:', deviceId);
  console.log('fingerprint:', fingerprint?.substring(0, 50) + '...');
  console.log('✅ LocalStorage saved!\n');
}

// Test 3: Giả lập đăng ký
async function testRegister() {
  console.log('🔍 Test 3: Simulate registration');
  console.log('→ Tạo fingerprint...');
  const fp = await generateFingerprint();
  console.log('→ Device ID:', fp.deviceId);
  console.log('→ IP:', await getPublicIP());
  console.log('✅ Ready to register!\n');
}

// Chạy test
async function runTests() {
  console.log('🧪 STARTING FRAUD SYSTEM TESTS\n');
  console.log('='.repeat(50));
  
  await testFingerprint();
  testLocalStorage();
  await testRegister();
  
  console.log('='.repeat(50));
  console.log('✅ All tests passed!');
  console.log('\n📝 Next steps:');
  console.log('1. Đăng ký tài khoản mới');
  console.log('2. Kiểm tra bảng devices trong Supabase');
  console.log('3. Đổi quà để test hard check');
  console.log('4. Tạo nhiều tài khoản để test cluster detection');
}

// Lấy IP public
async function getPublicIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

// Chạy
runTests();
