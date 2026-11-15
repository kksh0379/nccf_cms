'use strict';
const net = require('node:net');

const UNKNOWN = '확인 불가';
function classifyNetwork(data) {
  const c = data?.connection || {};
  const explicit = String(c.connection_type || '').toLowerCase();
  const direct = {'cellular':'이동통신','cable/dsl':'유선 회선','corporate':'기업망','satellite':'위성 회선'};
  if (direct[explicit]) return direct[explicit];
  const provider = [c.isp,c.org,c.domain].filter(Boolean).join(' ').toLowerCase();
  if (/amazon|aws|google cloud|google llc|microsoft|azure|digitalocean|cloudflare|akamai|ovh|hetzner|vultr|linode|oracle cloud|hosting|data ?center|datacentre|cloud computing/.test(provider)) return '데이터센터(추정)';
  if (/mobile|cellular|wireless|lte|5g|sk telecom|skt |kt mobile|lg u\+ mobile/.test(provider)) return '이동통신(추정)';
  if (/broadband|telecom|telecommunication|internet|korea telecom|sk broadband|kt corporation|lg u\+/.test(provider)) return '통신사망(추정)';
  return UNKNOWN;
}
function normalizeLookup(data) {
  if (!data || data.success !== true) return {country_code:null,network_type:UNKNOWN};
  const code = String(data.country_code || '').toUpperCase();
  return {country_code:/^[A-Z]{2}$/.test(code)?code:null,network_type:classifyNetwork(data)};
}
function lookupable(ip) {
  if (typeof ip !== 'string' || !net.isIP(ip)) return false;
  if (net.isIP(ip) === 4) {
    const [a,b,c] = ip.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) ||
      (a === 192 && b === 0) || (a === 192 && b === 0 && c === 2) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113));
  }
  const lower = ip.toLowerCase();
  return !(lower === '::1' || lower === '::' || lower.startsWith('fe8') ||
    lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb') ||
    lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('ff') ||
    lower.startsWith('2001:db8:'));
}
async function queryIp(ip, requester = fetch) {
  if (!lookupable(ip)) return {country_code:null,network_type:UNKNOWN};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1800);
  try {
    const result = await requester('https://ipwho.is/' + encodeURIComponent(ip), {
      signal:controller.signal,redirect:'error',headers:{accept:'application/json'}
    });
    return result.ok ? normalizeLookup(await result.json()) : {country_code:null,network_type:UNKNOWN};
  } catch {
    return {country_code:null,network_type:UNKNOWN};
  } finally {
    clearTimeout(timeout);
  }
}
module.exports = {UNKNOWN,classifyNetwork,normalizeLookup,lookupable,queryIp};
