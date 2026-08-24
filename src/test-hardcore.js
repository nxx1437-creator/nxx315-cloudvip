import { getProfessionalFingerprint } from './lib/fraud/fingerprint-pro.js';
import { ServerTracker } from './lib/fraud/serverTracker.js';
import { supabase } from './lib/supabaseClient.js';

async function hardcoreTest() {
  console.log('🔨 HARDCORE FINGERPRINT TEST\n');
  
  // 1. Get fingerprint
  const fp = await getProfessionalFingerprint();
  console.log('📱 Visitor ID:', fp.fingerprint);
  
  // 2. Kiểm tra cluster
  const cluster = await ServerTracker.detectClusters(fp);
  console.log(`\n📊 Cluster size: ${cluster.length} accounts`);
  
  cluster.forEach((acc, i) => {
    console.log(`  ${i+1}. ${acc.users?.username} (${acc.users?.email})`);
  });
  
  // 3. Kiểm tra registration
  const check = await ServerTracker.checkRegistration(fp);
  console.log(`\n✅ Allowed: ${check.allowed}`);
  if (check.warning) {
    console.log(`⚠️ Warning: ${check.warning}`);
  }
  if (!check.allowed) {
    console.log(`🚫 Blocked: ${check.reason}`);
  }
  
  // 4. Kiểm tra database trực tiếp
  console.log('\n📊 Database check:');
  const { data } = await supabase
    .from('devices')
    .select('user_id, permanent_id, users!inner(username, email)')
    .eq('permanent_id', fp.permanentId || fp.fingerprint);
  
  console.log(`  Found ${data?.length || 0} accounts with same permanent_id`);
  
  // 5. Kiểm tra devices table
  const { data: devices } = await supabase
    .from('devices')
    .select('*')
    .eq('fingerprint', fp.fingerprint);
  
  console.log(`\n📱 Devices with same fingerprint: ${devices?.length || 0}`);
}

hardcoreTest();
