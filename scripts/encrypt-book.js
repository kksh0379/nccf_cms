const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const secretsPath = path.join(root, '.local-secrets.json');
const apiBase = process.argv[2] || 'https://nccf-portfolio-analytics.onrender.com';
let secrets;

if (fs.existsSync(secretsPath)) {
  secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
} else {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('ADMIN_PASSWORD is required for first-time generation.');
  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  secrets = {
    ADMIN_PASSWORD_SCRYPT: `scrypt$${salt}$${hash}`,
    BOOK_CONTENT_KEY: crypto.randomBytes(32).toString('base64url')
  };
  fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 2), { mode: 0o600 });
}

const plaintext = execFileSync('git', ['show', 'd0d970b^:book-preview/index.html'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024
});
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(secrets.BOOK_CONTENT_KEY, salt, 200000, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final(), cipher.getAuthTag()]);
const payload = JSON.stringify({ salt: salt.toString('base64'), iv: iv.toString('base64'), ct: encrypted.toString('base64'), iter: 200000 });

const output = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="referrer" content="no-referrer">
<title>비공개 페이지</title>
<style>
  :root{--green:#008b43}*{box-sizing:border-box}html,body{margin:0;height:100%}body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f4f6f5;color:#222;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",Arial,sans-serif}.gate{width:calc(100% - 40px);max-width:360px;background:#fff;border:1px solid #e3e6e4;border-radius:12px;padding:34px 28px 26px;box-shadow:0 12px 40px rgba(0,0,0,.08);text-align:center}.lock{font-size:30px;margin-bottom:12px}.gate h1{margin:0 0 8px;font-size:18px}.gate p{margin:0 0 20px;font-size:13px;line-height:1.6;color:#666}.gate input,.gate button{width:100%;height:46px;border-radius:8px;font-size:15px}.gate input{border:1px solid #ccc;padding:0 14px}.gate input:focus{outline:none;border-color:var(--green)}.gate button{margin-top:12px;border:0;background:var(--green);color:#fff;font-weight:700;cursor:pointer}.gate button:disabled{background:#c9d6cf}.err{min-height:18px;margin-top:12px;font-size:12.5px;color:#d02b2b}
</style>
</head>
<body>
<form class="gate" id="gate" autocomplete="off"><div class="lock">🔒</div><h1>비공개 페이지</h1><p>이 페이지는 비밀번호로 보호되어 있습니다.<br>열람하려면 비밀번호를 입력하세요.</p><input type="password" id="pw" placeholder="비밀번호" aria-label="비밀번호" autocomplete="current-password" autofocus><button type="submit" id="go">확인</button><div class="err" id="err" role="alert"></div></form>
<script>
const API_BASE=${JSON.stringify(apiBase)},DATA=${payload};
const b64d=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function decryptWith(secret){const enc=new TextEncoder(),km=await crypto.subtle.importKey('raw',enc.encode(secret),'PBKDF2',false,['deriveKey']),key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64d(DATA.salt),iterations:DATA.iter,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']),pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(DATA.iv)},key,b64d(DATA.ct));return new TextDecoder().decode(pt)}
const form=document.getElementById('gate'),pw=document.getElementById('pw'),go=document.getElementById('go'),err=document.getElementById('err');
form.addEventListener('submit',async e=>{e.preventDefault();if(!pw.value)return;err.textContent='';go.disabled=true;try{const r=await fetch(API_BASE+'/api/book/unlock',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw.value}),cache:'no-store'});if(!r.ok)throw new Error(r.status===429?'잠시 후 다시 시도해 주세요.':'비밀번호가 올바르지 않습니다.');const data=await r.json(),html=await decryptWith(data.key);document.open();document.write(html);document.close()}catch(ex){err.textContent=ex.message||'페이지를 열지 못했습니다.';go.disabled=false;pw.select()}});
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'book-preview', 'index.html'), output);
console.log('Generated encrypted book preview.');

