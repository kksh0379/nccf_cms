const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {classifyNetwork,normalizeLookup,lookupable,queryIp}=require('../ip-enrichment');

test('country uses provider country code and network type never assumes a home identity',()=>{
  assert.deepEqual(normalizeLookup({success:true,country_code:'kr',connection:{isp:'SK Broadband'}}),{
    country_code:'KR',network_type:'통신사망(추정)'
  });
  assert.equal(classifyNetwork({connection:{isp:'KT Corporation'}}),'통신사망(추정)');
  assert.equal(classifyNetwork({connection:{connection_type:'Cellular'}}),'이동통신');
  assert.equal(classifyNetwork({connection:{connection_type:'Corporate'}}),'기업망');
  assert.equal(classifyNetwork({connection:{org:'Amazon AWS'}}),'데이터센터(추정)');
  assert.equal(classifyNetwork({connection:{isp:'Unknown'}}),'확인 불가');
  assert.deepEqual(normalizeLookup({success:false}),{country_code:null,network_type:'확인 불가'});
});
test('external lookup rejects invalid and private IPs and fails gracefully',async()=>{
  let calls=0;
  assert.equal(lookupable('10.2.3.4'),false);
  assert.equal(lookupable('127.0.0.1'),false);
  assert.equal(lookupable('203.0.113.15'),false);
  assert.equal(lookupable('112.217.189.34'),true);
  await queryIp('10.2.3.4',()=>{calls++;throw Error('should not request')});
  assert.equal(calls,0);
  const ok=await queryIp('112.217.189.34',async(url)=>({
    ok:true,json:async()=>({success:true,country_code:'KR',connection:{isp:'KT Corporation'}})
  }));
  assert.equal(ok.country_code,'KR');
  assert.equal(ok.network_type,'통신사망(추정)');
  assert.deepEqual(await queryIp('112.217.189.34',async()=>{throw Error('offline')}),{
    country_code:null,network_type:'확인 불가'
  });
});
test('protected stats attach network fields and throttle/cache IP enrichment',()=>{
  const server=fs.readFileSync(path.join(__dirname,'../server.js'),'utf8');
  const migration=fs.readFileSync(path.join(__dirname,'../migrations/001_init.sql'),'utf8');
  assert.match(server,/app\.get\('\/api\/admin\/stats', requireAllowedOrigin, requireAdmin/);
  assert.match(server,/toFetch = ips\.filter\(ip => !known\.has\(ip\)\)\.slice\(0, 8\)/);
  assert.match(server,/await enrichRecentLogs\(logs\.rows\)/);
  assert.match(server,/ip_network_cache/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS ip_network_cache/);
  assert.match(migration,/checked_at TIMESTAMPTZ/);
});
test('analytics table includes both fields without changing first two columns',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../../portfolio/reports-8f3d2a/index.html'),'utf8');
  assert.match(html,/<th>식별명<\/th><th>누적 방문<\/th><th>방문 시각<\/th><th>IP 주소<\/th><th>국가<\/th><th>회선 유형<\/th><th>페이지 경로<\/th>/);
  assert.match(html,/displayCountry\(v\.country_code\)/);
  assert.match(html,/esc\(v\.network_type\|\|"확인 불가"\)/);
  const snippet=html.slice(html.indexOf('    const esc='),html.indexOf('    async function load(){'));
  const context=vm.createContext({Intl});
  vm.runInContext(snippet+'\nthis.showCountry=displayCountry;',context);
  assert.match(context.showCountry('KR'),/대한민국/);
  assert.match(context.showCountry(null),/확인 불가/);
});
