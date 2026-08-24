import { supabase } from './lib/supabaseClient.js';
import { generateFingerprint } from './lib/fraud/fingerprint.js';
import { ClusterManager } from './lib/fraud/clusterManager.js';

async function testClusterDetection() {
  console.log('🧪 TEST CLUSTER DETECTION\n');
  
  // 1. Generate fingerprint (giả lập 1 thiết bị)
  const fp = await generateFingerprint();
  console.log('📱 Device fingerprint:', fp.fingerprint.substring(0, 30) + '...');
  
  // 2. Kiểm tra cluster hiện tại
  const existing = await ClusterManager.getClusterMembers(fp.fingerprint);
  console.log(`\n📊 Found ${existing.length} accounts in cluster:`);
  existing.forEach((acc, i) => {
    console.log(`  ${i+1}. ${acc.users?.username || 'unknown'} (${acc.users?.email || 'no email'})`);
  });
  
  // 3. Kiểm tra suspicious
  const isSuspicious = await ClusterManager.isSuspicious(fp.fingerprint);
  console.log(`\n⚠️ Suspicious: ${isSuspicious ? 'YES' : 'NO'}`);
  
  // 4. Nếu có nhiều account, hiển thị risk
  if (existing.length >= 3) {
    console.log(`\n🚨 WARNING: ${existing.length} accounts on same device!`);
    console.log('   → Risk level: HIGH');
    console.log('   → Suggestion: Block new registrations from this device');
  }
  
  // 5. Chi tiết cluster
  const clusterSize = await ClusterManager.getClusterSize(fp.fingerprint);
  console.log(`\n📊 Cluster size: ${clusterSize} accounts`);
}

// Chạy test
testClusterDetection();
