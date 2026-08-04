// ═══ STATE ═══
let loggedIn = false;
let pendingAction = null;
const USER = {id:'nccfmember',name:'김상화',email:'sanghwa@ncfoundation.or.kr',phone:'010-0000-0000',birth:'1990-05-15',emailVerified:true,niceVerified:false,
  svcs:{home:false,fair:false,proj:true,aac:true},
  donations:[{date:'2026-05',type:'정기기부',target:'나의AAC',amount:30000},{date:'2026-04',type:'정기기부',target:'나의AAC',amount:30000},{date:'2026-03',type:'일시기부',target:'프로젝토리',amount:50000}],
  consents:{terms:true,privacy:true,marketing:true,thirdParty:false,location:false},
  joinDate:'2026.05.27',
  consentDates:{termsAgreedAt:'2026.05.27',privacyAgreedAt:'2026.05.27',marketingAgreedAt:'2026.05.27',marketingWithdrawnAt:''}
};
let MS={mode:null,step:1,data:{},mpTab:'info'};

// ═══ BANNER RENDER ═══
function renderBanner(){
  const b=document.getElementById('banner');
  if(!loggedIn){
    b.innerHTML=`<div class="banner-in">
      <div class="banner-label"><div class="pulse"></div>통합회원 서비스 데모</div>
      <button class="top-link" onclick="goMembershipSite();setTimeout(showMembershipSignup,40)">회원가입</button>
      <button class="top-link" onclick="goMembershipSite()">로그인</button>
    </div>`;
  } else {
    b.innerHTML=`<div class="banner-in">
      <div class="banner-label"><div class="pulse"></div>통합회원 서비스 데모</div>
      <button class="top-link" onclick="window.open('http://aq.gy/f/XXPeM', '_blank', 'noopener,noreferrer')">기부신청</button>
      <button class="top-bell" onclick="toggleNotifications(event)" aria-label="알림"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></button>
    </div>`;
  }
}
function requireLogin(mode){
  if(!loggedIn){ pendingAction=mode; openM('login'); toast('로그인 후 이용할 수 있습니다'); return; }
  openM(mode);
}

// ═══ MODAL ═══
function openM(mode){MS={mode,step:1,data:{},mpTab:'info'};renderM();document.getElementById('ov').classList.add('open');document.body.style.overflow='hidden';
  if(mode==='mypage')document.getElementById('modal').classList.add('wide');
  else document.getElementById('modal').classList.remove('wide');
}
function closeM(){
  if(MS.mode==='signupPage'){showMembershipLogin();return;}
  if(MS.mode==='mypagePage'){showMembershipAccount();return;}
  document.getElementById('ov').classList.remove('open');
  document.body.style.overflow='';
}
function renderM(){
  if(MS.mode==='signupPage'){
    const page=document.getElementById('membershipPageView');
    if(page){page.className='membership-inline-flow';renderSignup(page);}
    return;
  }
  if(MS.mode==='mypagePage'){
    const page=document.getElementById('membershipPageView');
    if(page){page.className='membership-inline-flow membership-mypage-flow';renderMypage(page);}
    return;
  }
  const m=document.getElementById('modal');
  if(MS.mode==='login')renderLogin(m);
  else if(MS.mode==='signup')renderSignup(m);
  else if(MS.mode==='mypage')renderMypage(m);
}

// ═══ LOGIN ═══
function renderLogin(m){
  m.innerHTML=`${mHead('로그인',false)}
  <div class="mb"><div class="step-c">
    <div style="text-align:center;margin-bottom:20px">
      <div style="width:56px;height:56px;border-radius:50%;background:var(--cr);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:24px">🔐</div>
      <div style="font-size:14px;font-weight:700">통합회원 로그인</div>
      <div style="font-size:11px;color:var(--tx3);margin-top:3px">하나의 계정으로 모든 서비스를 이용하세요</div>
    </div>
    <div class="fg"><label class="fl">이메일<span class="rq">*</span></label><input class="fi" id="loginEmail" placeholder="이메일 주소" value="sanghwa@ncfoundation.or.kr"></div>
    <div class="fg"><label class="fl">비밀번호<span class="rq">*</span></label><input class="fi" type="password" id="loginPw" placeholder="비밀번호 입력" value="••••••••"></div>
    <div class="cg" style="margin-bottom:14px">
      <div class="ci ck"><div class="cb"></div><span class="cl">로그인 상태 유지</span></div>
    </div>
    <div style="display:flex;justify-content:center;gap:16px;margin-top:16px">
      <a href="#" style="font-size:11px;color:var(--tx3);text-decoration:none" onclick="event.preventDefault();openRecoveryFromLoginModal('id')">아이디 찾기</a>
      <span style="color:var(--cr-dd)">|</span>
      <a href="#" style="font-size:11px;color:var(--tx3);text-decoration:none" onclick="event.preventDefault();openRecoveryFromLoginModal('pw')">비밀번호 찾기</a>
      <span style="color:var(--cr-dd)">|</span>
      <a href="#" style="font-size:11px;color:var(--br);text-decoration:none;font-weight:600" onclick="event.preventDefault();closeM();setTimeout(()=>openM('signup'),300)">회원가입</a>
    </div>
  </div></div>
  <div class="mf"><button class="btn btn-p" onclick="doLogin()">로그인</button></div>`;
}

function doLogin(){
  loggedIn=true;
  closeM();
  renderBanner();
  toast(USER.name+'님 환영합니다!');
  if(pendingAction){ const next=pendingAction; pendingAction=null; setTimeout(()=>openM(next),320); }
}

function finishSignupLogin(){
  loggedIn=true;
  renderBanner();
  toast('가입 완료! 자동 로그인되었습니다');
  if(MS.mode==='signupPage'){showMembershipAccount();return;}
  closeM();
  if(typeof renderMembershipActions==='function') setTimeout(renderMembershipActions,40);
}
function toggleSignupService(el,key){
  if(!MS.data.sv) MS.data.sv={};
  MS.data.sv[key]=!MS.data.sv[key];
  el.classList.toggle('on', !!MS.data.sv[key]);
  const ck=el.querySelector('.sc2-ck');
  if(ck) ck.textContent=MS.data.sv[key]?'✓':'';
}
function getAgeFromBirth8(value){
  const v=String(value||'').replace(/\D/g,'');
  if(v.length!==8) return null;
  const y=Number(v.slice(0,4)), m=Number(v.slice(4,6)), d=Number(v.slice(6,8));
  const birth=new Date(y,m-1,d);
  if(birth.getFullYear()!==y || birth.getMonth()!==m-1 || birth.getDate()!==d) return null;
  const today=new Date();
  let age=today.getFullYear()-y;
  const beforeBirthday=(today.getMonth()+1<m)||((today.getMonth()+1===m)&&today.getDate()<d);
  if(beforeBirthday) age--;
  return age;
}
function sendEmailVerification(){
  const en=MS.data.signupLang==='en';
  const email=(MS.data.em||'').trim();
  const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(!valid){
    toast(en?'Please enter a valid email address.':'이메일 주소를 정확히 입력해 주세요.');
    return;
  }
  MS.data.emailCodeSent=true;
  MS.data.emailVerified=false;
  MS.data.emailCode='';
  MS.data.emailCodeExpiresAt=Date.now()+(30*60*1000);
  toast(en?'A verification code has been sent. It is valid for 30 minutes.':'인증번호를 발송했습니다. 유효시간은 30분입니다.');
  renderMPreserveScroll();
  requestAnimationFrame(startSignupEmailTimer);
}
function verifyEmailCode(){
  const en=MS.data.signupLang==='en';
  if(!MS.data.emailCodeSent){
    toast(en?'Please send a verification code first.':'먼저 인증번호를 발송해 주세요.');
    return;
  }
  if(!MS.data.emailCodeExpiresAt || Date.now()>=MS.data.emailCodeExpiresAt){
    MS.data.emailCodeSent=false;
    MS.data.emailVerified=false;
    MS.data.emailCode='';
    MS.data.emailCodeExpiresAt=0;
    toast(en?'The verification code has expired. Please request a new code.':'인증번호 유효시간이 만료되었습니다. 다시 발송해 주세요.');
    renderMPreserveScroll();
    return;
  }
  if((MS.data.emailCode||'').trim().length<4){
    toast(en?'Please enter the verification code.':'이메일로 받은 인증번호를 입력해 주세요.');
    return;
  }
  MS.data.emailVerified=true;
  toast(en?'Email verification completed.':'이메일 인증이 완료되었습니다.');
  renderMPreserveScroll();
  requestAnimationFrame(updateSignupStep2UI);
}

function doLogout(){
  loggedIn=false;
  try{
    localStorage.removeItem('nccfMembershipLogin');
    sessionStorage.removeItem('nccfMembershipLogin');
  }catch(e){}
  renderBanner();
  toast('로그아웃 되었습니다');
  if(document.body.classList.contains('membership-on')) showMembershipLogin();
}

function renderMypageInterestProjects(){
  const projectMeta={
    '프로젝토리':{desc:'청소년 창의교육',icon:'assets/images/asset_019.jpg'},
    'AAC':{desc:'보완대체 의사소통',icon:'assets/images/asset_020.jpg'},
    'AI 윤리':{desc:'기술 윤리',icon:'assets/images/asset_021.jpg'},
    '문화예술':{desc:'예술인 지원',icon:'assets/images/asset_022.jpg'}
  };
  const selected=(MS.data.interestProjects&&MS.data.interestProjects.length)
    ? MS.data.interestProjects.filter(name=>projectMeta[name])
    : ['프로젝토리','AAC','AI 윤리'];
  return selected.slice(0,3).map(name=>`
    <div class="mp-interest-project-item">
      <img class="mp-interest-project-icon" src="${projectMeta[name].icon}" alt="">
      <div class="mp-interest-project-copy">
        <div class="mp-interest-project-name">${name}</div>
        <div class="mp-interest-project-desc">${projectMeta[name].desc}</div>
      </div>
    </div>
  `).join('');
}

function updateMemberPhoneMatchUI(){
  const msg=document.getElementById('memberPhoneMatchMessage');
  if(!msg) return;
  const phone=String(MS.data.editPhone||'');
  const confirm=String(MS.data.editPhoneConfirm||'');
  const has=confirm.length>0;
  const same=has&&phone===confirm;
  const en=MS.data.signupLang==='en';
    msg.textContent=has?(same?(en?'The phone numbers match.':'휴대전화번호가 일치합니다.'):(en?'The phone numbers do not match.':'휴대전화번호가 일치하지 않습니다.')):'';
  msg.className=`signup-field-message ${has?(same?'ok':'bad'):''}`;
}

// ═══ MYPAGE ═══
function renderMypage(m){
  if(!m || !MS) return;
  if(!MS.data) MS.data={};
  const en=MS.data.signupLang==='en';
  const tab=['info','editInfo','consent','consentEdit'].includes(MS.mpTab)?MS.mpTab:'info';
  let body='';
  const tabsHtml=`<div class="mp-tabs">
    <div class="mp-tab ${(tab==='info'||tab==='editInfo')?'on':''}" onclick="MS.mpTab='info';renderM()">회원정보</div>
    <div class="mp-tab ${(tab==='consent'||tab==='consentEdit')?'on':''}" onclick="MS.mpTab='consent';renderM()">동의관리</div>
  </div>`;

  if(tab==='info'){
    body=`${tabsHtml}<div class="step-c">
      <div class="mp-card"><div class="mp-card-t">기본정보</div>
        <div class="mp-row"><span class="k">아이디</span><span class="v">${USER.id}</span></div>
        <div class="mp-row"><span class="k">이름</span><span class="v">${USER.name}</span></div>
        <div class="mp-row"><span class="k">이메일</span><span class="v">${USER.email}</span></div>
        <div class="mp-row"><span class="k">연락처</span><span class="v">${USER.phone}</span></div>
        <div class="mp-row"><span class="k">생년월일</span><span class="v">${USER.birth}</span></div>
        <div class="mp-row"><span class="k">가입일자</span><span class="v">${USER.joinDate}</span></div>
      </div>
      <div class="mp-card mp-interest-project-card">
        <div class="mp-card-t">관심 재단 사업</div>
        <div class="mp-interest-project-list">
          ${renderMypageInterestProjects()}
        </div>
      </div>
      <div class="mp-card"><div class="mp-card-t">인증정보</div>
        <div class="mp-row"><span class="k">이메일 인증</span><span class="v"><span class="mp-badge ${USER.emailVerified?'y':''}">${USER.emailVerified?'인증 완료':'미인증'}</span></span></div>
        <div class="mp-row"><span class="k">NICE 본인인증</span><span class="v"><span class="mp-badge ${USER.niceVerified?'y':''}">${USER.niceVerified?'인증 완료':'도입예정'}</span></span></div>
      </div>
      <div style="display:flex;gap:7px;margin-top:8px;flex-wrap:wrap">
        <button class="btn btn-s mp-small-action" type="button" onclick="openMemberInfoEdit()">회원정보 변경</button>
        <button class="btn btn-s mp-small-action" onclick="toast('비밀번호 변경 기능 준비 중')">비밀번호 변경</button>
        <button class="btn btn-s mp-small-action danger" onclick="toast('회원 탈퇴 기능 준비 중')">회원탈퇴</button>
      </div>
    </div>`;
  } else if(tab==='editInfo'){
    body=`${tabsHtml}<div class="step-c">
      <div class="st">회원정보 변경</div>
      <div class="sdesc">변경할 정보만 입력하고 개인정보 수집 및 이용에 동의한 뒤 한 번에 저장해 주세요.</div>
      <div class="mp-card">
        <div class="mp-card-t">이메일 변경</div>
        <div class="fg"><label class="fl">현재 이메일</label><input class="fi" value="${USER.email}" disabled></div>
        <div class="fg"><label class="fl">새 이메일</label><div class="inline-field-action signup-id-row">
          <input class="fi" type="email" placeholder="변경하지 않으려면 비워 두세요" value="${MS.data.editEmail||''}" oninput="MS.data.editEmail=this.value;MS.data.editEmailCodeSent=false;MS.data.editEmailVerified=false;MS.data.editEmailCode=''">
          <button class="btn inline-action-btn" type="button" onclick="sendMemberEmailVerification()">인증번호 발송</button>
        </div></div>
        ${MS.data.editEmailCodeSent?`<div class="fg"><label class="fl">인증번호</label><div class="inline-field-action">
          <input class="fi" inputmode="numeric" maxlength="6" placeholder="인증번호 6자리" value="${MS.data.editEmailCode||''}" oninput="MS.data.editEmailCode=this.value.replace(/[^0-9]/g,'').slice(0,6)">
          <button class="btn inline-action-btn" type="button" onclick="verifyMemberEmailCode()">인증 확인</button>
        </div><div class="consent-note">데모에서는 4~6자리 숫자를 입력하면 인증됩니다.</div></div>`:''}
        ${MS.data.editEmailVerified?'<div style="margin-top:10px"><span class="vf">✓ 새 이메일 인증 완료</span></div>':''}
      </div>
      <div class="mp-card">
        <div class="mp-card-t">휴대전화번호 변경</div>
        <div class="sdesc mp-phone-change-desc">회원가입과 동일하게 변경할 휴대전화번호를 두 번 입력해 주세요.</div>
        <div class="fg signup-phone-field"><label class="fl">휴대전화번호</label>
          <input class="fi" inputmode="numeric" maxlength="11" autocomplete="tel" placeholder="변경하지 않으려면 비워 두세요" value="${MS.data.editPhone||''}" oninput="MS.data.editPhone=this.value.replace(/[^0-9]/g,'').slice(0,11);this.value=MS.data.editPhone;updateMemberPhoneMatchUI()"></div>
        <div class="fg signup-phone-field"><label class="fl">휴대전화번호 재입력</label>
          <input class="fi" inputmode="numeric" maxlength="11" placeholder="${en?'Re-enter your mobile phone number':'휴대전화번호를 다시 입력해 주세요'}" value="${MS.data.editPhoneConfirm||''}" oninput="MS.data.editPhoneConfirm=this.value.replace(/[^0-9]/g,'').slice(0,11);this.value=MS.data.editPhoneConfirm;updateMemberPhoneMatchUI()">
          <div id="memberPhoneMatchMessage" class="signup-field-message ${MS.data.editPhoneConfirm?(MS.data.editPhone===MS.data.editPhoneConfirm?'ok':'bad'):''}">${MS.data.editPhoneConfirm?(MS.data.editPhone===MS.data.editPhoneConfirm?'휴대전화번호가 일치합니다.':'휴대전화번호가 일치하지 않습니다.'):''}</div>
        </div>
      </div>
      <div class="mp-card member-edit-consent-card">
        <div class="mp-card-t">정보 변경 동의</div>
        <div class="member-edit-consent-row">
          <label class="member-edit-consent-check"><input type="checkbox" ${MS.data.editPrivacyConsent?'checked':''} onchange="MS.data.editPrivacyConsent=this.checked"><span><strong>(필수)</strong> 개인정보 수집 및 이용에 동의합니다.</span></label>
          <button type="button" class="agree-view-btn" onclick="showAgreement('privacy', false)">보기</button>
        </div>
        <div class="member-edit-consent-row">
          <label class="member-edit-consent-check"><input type="checkbox" ${MS.data.editMarketingConsent?'checked':''} onchange="MS.data.editMarketingConsent=this.checked"><span><strong>(선택)</strong> 광고 및 마케팅 목적 활용에 동의합니다.</span></label>
          <button type="button" class="agree-view-btn" onclick="showAgreement('marketing', false)">보기</button>
        </div>
      </div>
      <div class="member-edit-actions"><button class="btn btn-s" type="button" onclick="MS.mpTab='info';renderM()">취소</button><button class="btn btn-p" type="button" onclick="saveMemberInfoChanges()">변경사항 저장</button></div>
    </div>`;
  } else if(tab==='consent'){
    const marketingDateLabel=USER.consents.marketing?'동의일시':'철회일시';
    const marketingDateValue=USER.consents.marketing?USER.consentDates.marketingAgreedAt:(USER.consentDates.marketingWithdrawnAt||'-');
    body=`${tabsHtml}<div class="step-c">
      <div class="sdesc">회원가입 및 회원정보 변경 화면에서 처리한 동의 여부와 처리일시를 확인할 수 있습니다.</div>
      <div class="mp-card consent-history-card">
        <div class="mp-consent consent-history-row"><div><div class="consent-history-title">(필수) 멤버십 이용약관</div><div class="consent-history-date">동의일시 ${USER.consentDates.termsAgreedAt}</div></div><span class="mp-badge y">동의</span></div>
        <div class="mp-consent consent-history-row"><div><div class="consent-history-title">(필수) 개인정보 수집 및 이용</div><div class="consent-history-date">동의일시 ${USER.consentDates.privacyAgreedAt}</div></div><span class="mp-badge ${USER.consents.privacy?'y':'n'}">${USER.consents.privacy?'동의':'미동의'}</span></div>
        <div class="mp-consent consent-history-row">
          <div><div class="consent-history-title">(선택) 광고 및 마케팅 목적 활용</div><div class="consent-history-date">${marketingDateLabel} ${marketingDateValue}</div></div>
          <div class="consent-history-actions">
            <span class="mp-badge ${USER.consents.marketing?'y':'n'}">${USER.consents.marketing?'동의':'철회'}</span>
            <button type="button" class="consent-withdraw-btn" onclick="requestMarketingConsentChange()">${USER.consents.marketing?'동의 철회':'동의하기'}</button>
          </div>
        </div>
      </div>
      <div class="sinfo" style="margin-top:8px;color:#E53935;border-left-color:#E53935;background:rgba(229,57,53,.05)">※ 동의 철회 시 이벤트 및 혜택 안내가 제한됩니다.</div>
    </div>`;
  }
  m.innerHTML=`${mHead('마이페이지',false)}<div class="mb">${body}</div>`;
}

// ═══ SIGNUP ═══

function formatSignupPhone(value){
  const digits=String(value||'').replace(/\D/g,'');
  if(digits.length===11)return digits.replace(/(\d{3})(\d{4})(\d{4})/,'$1-$2-$3');
  if(digits.length===10)return digits.replace(/(\d{3})(\d{3})(\d{4})/,'$1-$2-$3');
  return digits;
}

function renderSignup(m){
  const interestProjects=[
      {name:'프로젝토리',desc:'청소년 창의교육',icon:'assets/images/asset_019.jpg'},
      {name:'AAC',desc:'보완대체 의사소통',icon:'assets/images/asset_020.jpg'},
      {name:'AI 윤리',desc:'기술 윤리',icon:'assets/images/asset_021.jpg'},
      {name:'문화예술',desc:'예술인 지원',icon:'assets/images/asset_022.jpg'}
  ];
  const s=MS.step;
  let body='';
  if(!MS.data.signupLang) MS.data.signupLang='ko';

  if(s===1){
    const en=MS.data.signupLang==='en';
    body=`<div class="step-c">
      <div class="st">${en?'Terms Agreement':'약관동의'}</div>
      <div class="sdesc">${en?'After agreeing to the terms, proceed to personal information and email verification.':'약관 동의 후 개인정보 입력 및 이메일 인증 단계로 이동합니다.'}</div>
      <div class="cg consent-list">
        <div class="ci consent-row all consent-check ${MS.data.aa?'ck':''}" onclick="event.preventDefault();event.stopPropagation();tgAll(this)"><div class="cb"></div><span class="cl b">${en?'Agree to all':'전체 동의'}</span></div>
        <div class="consent-items">
          <div class="consent-row ${MS.data.a0?'ck':''}">
            <div class="ci consent-check ${MS.data.a0?'ck':''}" onclick="event.preventDefault();event.stopPropagation();toggleSignupConsent('a0',this)"><div class="cb"></div><span class="cl">${en?'I am 19 years of age or older.':'(필수) 만 19세 이상입니다.'}</span></div>
          </div>
          <div class="consent-row ${MS.data.a1?'ck':''}">
            <div class="ci consent-check ${MS.data.a1?'ck':''}" onclick="event.preventDefault();event.stopPropagation();toggleSignupConsent('a1',this)"><div class="cb"></div><span class="cl">${en?'I agree to the Membership Terms of Use.':'(필수) '}<a href="https://www.ncfoundation.or.kr/membership_terms" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" style="font-weight:800;text-decoration:underline;color:inherit">${en?'Membership Terms of Use':'멤버십 이용약관'}</a>${en?'':'에 동의합니다.'}</span></div>
          </div>
          <div class="consent-row ${MS.data.a2?'ck':''}">
            <div class="ci consent-check ${MS.data.a2?'ck':''}" onclick="event.preventDefault();event.stopPropagation();toggleSignupConsent('a2',this)"><div class="cb"></div><span class="cl">${en?'I agree to the collection and use of personal information.':'(필수) 개인정보 수집 및 이용에 동의합니다.'}</span></div>
            <button type="button" class="agree-view-btn" onclick="event.stopPropagation();showAgreement('privacy', ${en})">${en?'View':'보기'}</button>
          </div>
          <div class="consent-row marketing-row ${MS.data.a4?'ck':''}">
            <div class="consent-copy">
              <div class="ci consent-check ${MS.data.a4?'ck':''}" onclick="event.preventDefault();event.stopPropagation();toggleSignupConsent('a4',this)"><div class="cb"></div><span class="cl">${en?'I agree to the use of my information for advertising and marketing purposes.':'(선택) 광고 및 마케팅 목적 활용에 동의합니다'}</span></div>
              <div class="consent-note signup-marketing-note">${en?'If you do not agree, event and benefit notifications may be limited.':'※ 미동의 시 이벤트 및 혜택 안내가 제한됩니다.'}</div>
            </div>
            <button type="button" class="agree-view-btn" onclick="event.stopPropagation();showAgreement('marketing', ${en})">${en?'View':'보기'}</button>
          </div>
        </div>
      </div><div class="divider"></div>
    </div>`;
  } else if(s===2){
    const en=MS.data.signupLang==='en';
    body=`<div class="step-c">
      <div class="st">${en?'Email Verification':'이메일 인증'}</div>
      <div class="sdesc">${en?'Verify the email address used for account recovery and important membership notices.':'계정 찾기 및 주요 회원 안내에 사용할 이메일 주소를 인증해 주세요.'}</div>
      <div class="fg">
        <label class="fl">${en?'Email address':'이메일'}<span class="rq">*</span></label>
        <div class="inline-field-action signup-email-action">
          <input class="fi" type="email" autocomplete="email" placeholder="name@example.com" value="${MS.data.em||''}" oninput="MS.data.em=this.value;MS.data.emailVerified=false;MS.data.emailCodeSent=false;MS.data.emailCode='';MS.data.emailCodeExpiresAt=0;updateSignupStep2UI()">
          <button class="btn inline-action-btn" type="button" onclick="sendEmailVerification()">${en?'Send code':'인증번호 발송'}</button>
        </div>
      </div>
      ${MS.data.emailCodeSent?`<div class="fg">
        <label class="fl">${en?'Verification code':'인증번호'}<span class="rq">*</span></label>
        <div class="inline-field-action signup-email-code-action">
          <input class="fi" inputmode="numeric" maxlength="6" placeholder="${en?'Enter the code':'인증번호 6자리'}" value="${MS.data.emailCode||''}" oninput="MS.data.emailCode=this.value.replace(/[^0-9]/g,'').slice(0,6)">
          <button class="btn inline-action-btn" type="button" onclick="verifyEmailCode()">${en?'Verify':'인증 확인'}</button>
        </div>
        <div id="signupEmailTimer" class="signup-email-timer"></div>
        <div class="consent-note">${en?'Demo: any 4–6 digit code is accepted within 30 minutes.':'데모에서는 30분 이내 4~6자리 숫자를 입력하면 인증됩니다.'}</div>
      </div>`:''}
      ${MS.data.emailVerified?`<div style="margin-top:12px"><span class="vf">✓ ${en?'Email verification completed':'이메일 인증 완료'}</span></div>`:''}
    </div>`;
  } else if(s===3){
    const en=MS.data.signupLang==='en';
    const has = (group,val)=>((MS.data[group]||[]).includes(val));
    const purposeItems=[
      '사회문제 해결 및 공익 활동에 동참하기 위해',
      '재단 사회공헌 프로그램에 참여하기 위해',
      '공익사업 운영을 위한 기부·후원을 하기 위해',
      '인적 네트워크 형성 및 정보 교류를 위해',
      '재단 주최 행사, 공연 및 세미나 참여를 위해'
    ];
    const interestFields=[
      '소외계층 지원',
      '문화·예술 진흥',
      '교육·장학 사업',
      '보건·의료 지원',
      '긴급 구호·인권',
      '환경·생태 보전'
    ];

    const awarenessItems=[
      '재단 공식 온라인 채널',
      '온라인 콘텐츠(블로그 등)',
      '지인 소개 또는 추천',
      '오프라인 홍보물',
      '재단 주관 행사(세미나 등)'
    ];
    const purposeEn={
      '사회문제 해결 및 공익 활동에 동참하기 위해':'To participate in solving social issues and public-interest activities',
      '재단 사회공헌 프로그램에 참여하기 위해':'To participate in the foundation’s social contribution programs',
      '공익사업 운영을 위한 기부·후원을 하기 위해':'To donate or sponsor public-interest programs',
      '인적 네트워크 형성 및 정보 교류를 위해':'To build networks and exchange information',
      '재단 주최 행사, 공연 및 세미나 참여를 위해':'To attend foundation events, performances, and seminars'
    };
    const interestFieldEn={
      '소외계층 지원':'Support for underserved communities',
      '문화·예술 진흥':'Culture and arts promotion',
      '교육·장학 사업':'Education and scholarships',
      '보건·의료 지원':'Health and medical support',
      '긴급 구호·인권':'Emergency relief and human rights',
      '환경·생태 보전':'Environmental and ecological conservation'
    };
    const projectEn={
      '프로젝토리':{name:'Projectory',desc:'Creative education for youth'},
      'AAC':{name:'AAC',desc:'Augmentative and alternative communication'},
      'AI 윤리':{name:'AI Ethics',desc:'Technology ethics'},
      '문화예술':{name:'Culture & Arts',desc:'Support for artists'}
    };
    const awarenessEn={
      '재단 공식 온라인 채널':'Official foundation online channels',
      '온라인 콘텐츠(블로그 등)':'Online content (blogs, etc.)',
      '지인 소개 또는 추천':'Referral or recommendation',
      '오프라인 홍보물':'Offline promotional materials',
      '재단 주관 행사(세미나 등)':'Foundation-hosted events (seminars, etc.)'
    };
    body=`<div class="step-c">
      <div class="st">${en?'Personal Information':'개인정보 입력'}</div>
      <div class="sdesc">${en?'Please enter the required information for membership and service use.':'회원정보와 서비스 이용을 위한 필수 정보를 입력해 주세요.'}</div>

      <div class="signup-section-heading">${en?'Basic Information':'기본정보'}</div>
      <div class="fg">
        <label class="fl">${en?'Name':'이름'}<span class="rq">*</span></label>
        <input class="fi" autocomplete="name" placeholder="${en?'Full name':'이름'}" value="${MS.data.nm||''}" oninput="MS.data.nm=this.value;updateSignupStep3UI()">
      </div>

      <div class="fg signup-birth-field">
        <label class="fl">${en?'Date of Birth':'생년월일'}<span class="rq">*</span></label>
        <div class="signup-birth-row">
          <div class="signup-birth-control year">
            <select class="fi" aria-label="${en?'Birth year':'출생연도'}" onchange="MS.data.birthYear=this.value;syncSignupBirthDate();updateSignupStep3UI()">
              ${getSignupBirthYearOptions(MS.data.birthYear,en)}
            </select>
            <span class="signup-birth-unit">${en?'Year':'년'}</span>
          </div>
          <div class="signup-birth-control">
            <input class="fi" inputmode="numeric" maxlength="2" aria-label="${en?'Birth month':'출생월'}" placeholder="MM" value="${MS.data.birthMonth||''}" oninput="this.value=sanitizeSignupDatePart(this.value,12);MS.data.birthMonth=this.value;syncSignupBirthDate();updateSignupStep3UI()" onblur="normalizeSignupDatePart(this,'birthMonth',12)">
            <span class="signup-birth-unit">${en?'Month':'월'}</span>
          </div>
          <div class="signup-birth-control">
            <input class="fi" inputmode="numeric" maxlength="2" aria-label="${en?'Birth day':'출생일'}" placeholder="DD" value="${MS.data.birthDay||''}" oninput="this.value=sanitizeSignupDatePart(this.value,31);MS.data.birthDay=this.value;syncSignupBirthDate();updateSignupStep3UI()" onblur="normalizeSignupDatePart(this,'birthDay',31)">
            <span class="signup-birth-unit">${en?'Day':'일'}</span>
          </div>
        </div>
        <div class="consent-note">${en?'You must be at least 19 years old to register.':'만 만 19세 이상 가입할 수 있습니다.'}</div>
      </div>

      <div class="fg signup-gender-field">
        <label class="fl">${en?'Gender':'성별'}<span class="rq">*</span></label>
        <div class="signup-gender-options" role="radiogroup" aria-label="${en?'Gender':'성별'}">
          <button type="button" class="signup-gender-option ${MS.data.gender==='M'?'on':''}" role="radio" aria-checked="${MS.data.gender==='M'}" onclick="MS.data.gender='M';renderMPreserveScroll()">${en?'Male':'남성'}</button>
          <button type="button" class="signup-gender-option ${MS.data.gender==='F'?'on':''}" role="radio" aria-checked="${MS.data.gender==='F'}" onclick="MS.data.gender='F';renderMPreserveScroll()">${en?'Female':'여성'}</button>
        </div>
      </div>

      <div class="fg signup-phone-field">
        <label class="fl">${en?'Mobile Phone Number':'휴대전화번호'}<span class="rq">*</span></label>
        <input class="fi" inputmode="numeric" maxlength="11" autocomplete="tel" placeholder="01000000000" value="${MS.data.hp||''}" oninput="MS.data.hp=this.value.replace(/[^0-9]/g,'').slice(0,11);this.value=MS.data.hp;updateSignupStep3UI()">
      </div>
      <div class="fg signup-phone-field">
        <label class="fl">${en?'Re-enter Mobile Phone Number':'휴대전화번호 재입력'}<span class="rq">*</span></label>
        <input class="fi" inputmode="numeric" maxlength="11" placeholder="${en?'Re-enter your mobile phone number':'휴대전화번호를 다시 입력해 주세요'}" value="${MS.data.hpConfirm||''}" oninput="MS.data.hpConfirm=this.value.replace(/[^0-9]/g,'').slice(0,11);this.value=MS.data.hpConfirm;updateSignupStep3UI()">
        <div id="phoneMatchMessage" class="signup-field-message ${MS.data.hpConfirm?(MS.data.hp===MS.data.hpConfirm?'ok':'bad'):''}">${MS.data.hpConfirm?(MS.data.hp===MS.data.hpConfirm?(en?'The phone numbers match.':'휴대전화번호가 일치합니다.'):(en?'The phone numbers do not match.':'휴대전화번호가 일치하지 않습니다.')):''}</div>
      </div>

      <div class="signup-section-heading account">${en?'Account Information':'계정정보'}</div>
      <div class="fg"><label class="fl">${en?'ID':'아이디'}<span class="rq">*</span></label><div class="inline-field-action"><input class="fi" inputmode="latin" autocomplete="username" maxlength="20" pattern="[A-Za-z0-9]+" placeholder="${en?'Use letters and numbers':'영문·숫자 조합'}" value="${MS.data.uid||''}" oninput="MS.data.uid=this.value.replace(/[^A-Za-z0-9]/g,'').slice(0,20);this.value=MS.data.uid;MS.data.uidChecked=false;updateSignupStep3UI()"><button class="btn inline-action-btn signup-id-check-btn" type="button" onclick="checkSignupIdAvailability()">${en?'Check ID':'중복확인'}</button></div>${MS.data.uidChecked?`<div class="consent-note">${en?'This ID is available.':'사용 가능한 아이디입니다.'}</div>`:''}</div>
      <div class="fg password-policy-field">
        <label class="fl" for="signupPassword">${en?'Password':'비밀번호'}<span class="rq">*</span></label>
        <input class="fi" id="signupPassword" type="password" autocomplete="new-password" placeholder="${en?'Use 3 character types, at least 8 characters':'영문 대·소문자, 숫자, 특수문자 중 3종류 이상 · 8자리 이상'}" value="${MS.data.pw||''}" oninput="MS.data.pw=this.value;updateSignupPasswordUI()">
        <div class="password-policy-box" aria-live="polite">
          <div class="password-policy-title">${en?'Password Requirements':'비밀번호 설정 규칙'}</div>
          <div id="pwRuleLength" class="password-rule">${en?'• At least 8 characters using 3 or more character types':'• 3종류 이상 조합 시 8자리 이상'}</div>
          <div id="pwRuleTypes" class="password-rule">${en?'• Use at least 3 of: uppercase, lowercase, numbers, and symbols':'• 영문 대문자·소문자·숫자·특수문자 중 3종류 이상 조합'}</div>
          <div id="pwRuleWeak" class="password-rule">${en?'• Do not use repeated characters, sequences, keyboard patterns, birthdays, or phone numbers':'• 반복 문자, 연속 숫자, 키보드 배열, 생일·전화번호 등 추측하기 쉬운 조합 사용 불가'}</div>
        </div>
      </div>
      <div class="fg"><label class="fl" for="signupPasswordConfirm">${en?'Confirm Password':'비밀번호 확인'}<span class="rq">*</span></label><input class="fi" id="signupPasswordConfirm" type="password" autocomplete="new-password" placeholder="${en?'Re-enter your password':'비밀번호 재입력'}" value="${MS.data.pwConfirm||''}" oninput="MS.data.pwConfirm=this.value;updateSignupPasswordUI()"><div id="pwMatchMessage" class="password-match-message"></div></div>
      <div class="password-management-note">
        <strong>${en?'Password Management Policy':'비밀번호 관리 정책'}</strong>
        <span>${en?'Change your password every six months. Your previous password and any password used within the last 12 months cannot be reused. Initial passwords must be changed at first login, and passwords cannot be changed again for at least one day.':'6개월마다 변경하며, 직전 비밀번호 및 최근 12개월 내 사용한 비밀번호는 재사용할 수 없습니다. 초기 비밀번호는 최초 접속 시 변경해야 하며, 비밀번호 변경 후 최소 1일 동안 재변경할 수 없습니다.'}</span>
      </div>

      <div class="choice-section">
        <div class="choice-title">${en?'Affiliation':'소속'}<span class="rq">*</span></div>
        <div class="choice-desc">${en?'This field is required.':'필수 입력 항목입니다.'}</div>
        <div class="fg"><select class="fi" required onchange="MS.data.affiliation=this.value;renderMPreserveScroll()">
          <option value="">${en?'Select':'선택'}</option>
          <option ${MS.data.affiliation==='educator'?'selected':''} value="educator">${en?'Educator (teacher or professor)':'교육인(교사, 교수)'}</option>
          <option ${MS.data.affiliation==='university'?'selected':''} value="university">${en?'University or graduate student':'대학생(대학원생)'}</option>
          <option ${MS.data.affiliation==='employee'?'selected':''} value="employee">${en?'Employee or business professional':'직장인(기업인)'}</option>
          <option ${MS.data.affiliation==='medical'?'selected':''} value="medical">${en?'Healthcare professional (therapist or rehabilitation specialist)':'의료인(치료사, 재활사)'}</option>
          <option ${MS.data.affiliation==='nonprofit'?'selected':''} value="nonprofit">${en?'Nonprofit or social contribution professional':'비영리/사회공헌(사회복지사)'}</option>
          <option ${MS.data.affiliation==='arts'?'selected':''} value="arts">${en?'Culture and arts professional':'문화예술(예술가, 프리랜서)'}</option>
          <option ${MS.data.affiliation==='science'?'selected':''} value="science">${en?'Science and technology researcher':'과학기술(연구자)'}</option>
          <option ${MS.data.affiliation==='etc'?'selected':''} value="etc">${en?'Other':'기타'}</option>
        </select></div>
      </div>

      <div class="choice-section">
        <div class="choice-title">${en?'Purpose of Membership':'가입목적'}<span class="rq">*</span></div><div class="choice-desc">${en?'Select at least one.':'1개 이상 선택해 주세요.'}</div>
        <div class="option-list">
          ${purposeItems.map(v=>`<div class="option-card ${has('purposes',v)?'on':''}" onclick="toggleMulti('purposes','${v}',this)"><div class="option-check"></div><div class="option-main">${en?purposeEn[v]:v}</div></div>`).join('')}
        </div>
      </div>

      <div class="choice-section">
        <div class="choice-title">${en?'Areas of Interest':'관심분야'}<span class="rq">*</span></div><div class="choice-desc">${en?'Select at least one.':'1개 이상 선택해 주세요.'}</div>
        <div class="option-list compact">
          ${interestFields.map(v=>`<div class="option-card ${has('interestFields',v)?'on':''}" onclick="toggleMulti('interestFields','${v}',this)"><div class="option-check"></div><div class="option-main">${en?interestFieldEn[v]:v}</div></div>`).join('')}
        </div>
      </div>

      <div class="choice-section">
        <div class="choice-title">${en?'Foundation Programs of Interest':'관심사업'}<span class="rq">*</span></div><div class="choice-desc">${en?'Select at least one.':'1개 이상 선택해 주세요.'}</div>
        <div class="option-list compact">
          ${interestProjects.map(v=>`<div class="option-card project-option ${has('interestProjects',v.name)?'on':''}" onclick="toggleMulti('interestProjects','${v.name}',this)"><div class="option-check"></div><img class="project-option-icon" src="${v.icon}" alt=""><div><div class="option-main">${en&&projectEn[v.name]?projectEn[v.name].name:v.name}</div><div class="option-sub">${en&&projectEn[v.name]?projectEn[v.name].desc:v.desc}</div></div></div>`).join('')}
        </div>
      </div>

      <div class="choice-section">
        <div class="choice-title">${en?'How Did You Hear About NCCF?':'재단 인지 경로'}<span class="rq">*</span></div>
        <div class="choice-desc">${en?'Select at least one.':'1개 이상 선택해 주세요.'}</div>
        <div class="option-list">
          ${awarenessItems.map(v=>`<div class="option-card ${has('awarenessRoutes',v)?'on':''}" onclick="toggleMulti('awarenessRoutes','${v}',this)"><div class="option-check"></div><div class="option-main">${en?awarenessEn[v]:v}</div></div>`).join('')}
        </div>
      </div>`;
  } else {
    const en=MS.data.signupLang==='en';
    const affiliationKo={educator:'교육인(교사, 교수)',university:'대학생(대학원생)',employee:'직장인(기업인)',medical:'의료인(치료사, 재활사)',nonprofit:'비영리/사회공헌(사회복지사)',arts:'문화예술(예술가, 프리랜서)',science:'과학기술(연구자)',etc:'기타'};
    const affiliationEn={educator:'Educator (teacher or professor)',university:'University or graduate student',employee:'Employee or business professional',medical:'Healthcare professional',nonprofit:'Nonprofit or social contribution professional',arts:'Culture and arts professional',science:'Science and technology researcher',etc:'Other'};
    const purposeEn={'사회문제 해결 및 공익 활동에 동참하기 위해':'To participate in solving social issues and public-interest activities','재단 사회공헌 프로그램에 참여하기 위해':'To participate in the foundation’s social contribution programs','공익사업 운영을 위한 기부·후원을 하기 위해':'To donate or sponsor public-interest programs','인적 네트워크 형성 및 정보 교류를 위해':'To build networks and exchange information','재단 주최 행사, 공연 및 세미나 참여를 위해':'To attend foundation events, performances, and seminars'};
    const interestFieldEn={'소외계층 지원':'Support for underserved communities','문화·예술 진흥':'Culture and arts promotion','교육·장학 사업':'Education and scholarships','보건·의료 지원':'Health and medical support','긴급 구호·인권':'Emergency relief and human rights','환경·생태 보전':'Environmental and ecological conservation'};
    const awarenessEn={'재단 공식 온라인 채널':'Official foundation online channels','온라인 콘텐츠(블로그 등)':'Online content (blogs, etc.)','지인 소개 또는 추천':'Referral or recommendation','오프라인 홍보물':'Offline promotional materials','재단 주관 행사(세미나 등)':'Foundation-hosted events (seminars, etc.)'};
    const projectNameEn={'프로젝토리':'Projectory','AAC':'AAC','AI 윤리':'AI Ethics','문화예술':'Culture & Arts'};
    const affiliationLabel=((en?affiliationEn:affiliationKo)[MS.data.affiliation]||(en?'Not selected':'미선택'));
    const verticalItems=(items,map)=>items&&items.length
      ? `<ul class="signup-summary-list">${items.map(v=>`<li>${en&&map?(map[v]||v):v}</li>`).join('')}</ul>`
      : `<span class="signup-summary-empty">${en?'Not selected':'미선택'}</span>`;
    const projectItems=(MS.data.interestProjects||[]).map(name=>{
      const project=interestProjects.find(v=>v.name===name);
      return project||{name,icon:''};
    });
    body=`<div class="step-c"><div class="succ"><div class="succ-i">🎉</div><div class="succ-t">${en?'Registration Complete!':'가입 완료!'}</div><div class="succ-d">${en?'Your NCCF Gachijieum Membership registration has been completed.':'NC문화재단 가치지음 멤버십이 완료되었습니다.'}</div></div>
      <div class="sum"><div class="sum-h">${en?'Registration Information':'가입 정보'}</div><div class="sum-b">
        <div class="sum-r signup-summary-block signup-summary-basic"><span class="lb">${en?'ID':'아이디'}</span><div class="vl signup-summary-value">${MS.data.uid||'nccfmember'}</div></div>
        <div class="sum-r signup-summary-block signup-summary-basic"><span class="lb">${en?'Email':'이메일'}</span><div class="vl signup-summary-value">${MS.data.em||'sanghwa@ncfoundation.or.kr'}</div></div>
        <div class="sum-r signup-summary-block signup-summary-basic"><span class="lb">${en?'Name':'이름'}</span><div class="vl signup-summary-value">${MS.data.nm||'김상화'}</div></div>
        <div class="sum-r signup-summary-block signup-summary-basic"><span class="lb">${en?'Date of Birth':'생년월일'}</span><div class="vl signup-summary-value">${MS.data.birthYear&&MS.data.birthMonth&&MS.data.birthDay?`${MS.data.birthYear}.${String(MS.data.birthMonth).padStart(2,'0')}.${String(MS.data.birthDay).padStart(2,'0')}`:(en?'Not entered':'미입력')}</div></div>
        <div class="sum-r signup-summary-block signup-summary-basic"><span class="lb">${en?'Mobile Phone Number':'휴대전화번호'}</span><div class="vl signup-summary-value">${formatSignupPhone(MS.data.hp)||(en?'Not entered':'미입력')}</div></div>
        <div class="sum-r signup-summary-block"><span class="lb">${en?'Affiliation':'소속'}</span><div class="vl signup-summary-value"><ul class="signup-summary-list"><li>${affiliationLabel}</li></ul></div></div>
        <div class="sum-r signup-summary-block"><span class="lb">${en?'Purpose of Membership':'가입목적'}</span><div class="vl signup-summary-value">${verticalItems(MS.data.purposes||[],purposeEn)}</div></div>
        <div class="sum-r signup-summary-block"><span class="lb">${en?'Areas of Interest':'관심분야'}</span><div class="vl signup-summary-value">${verticalItems(MS.data.interestFields||[],interestFieldEn)}</div></div>
        <div class="sum-r signup-summary-block"><span class="lb">${en?'Foundation Programs of Interest':'관심사업'}</span><div class="vl signup-summary-value">
          ${projectItems.length?`<ul class="signup-summary-list signup-project-summary-list">${projectItems.map(v=>`<li><img src="${v.icon}" alt="" class="signup-project-summary-icon"><span>${en?(projectNameEn[v.name]||v.name):v.name}</span></li>`).join('')}</ul>`:`<span class="signup-summary-empty">${en?'Not selected':'미선택'}</span>`}
        </div></div>
        <div class="sum-r signup-summary-block"><span class="lb">${en?'How You Heard About NCCF':'재단 인지 경로'}</span><div class="vl signup-summary-value">${verticalItems(MS.data.awarenessRoutes||[],awarenessEn)}</div></div>
      </div></div>
    </div>`;

  }
  const ok=s===1?!!(MS.data.a0&&MS.data.a1&&MS.data.a2)
    :s===2?!!MS.data.emailVerified
    :true;
  const en=MS.data.signupLang==='en';
  m.innerHTML=`<div class="signup-login-backbar"><button class="signup-login-backbtn" type="button" onclick="showMembershipLogin()" aria-label="${en?'Return to login':'로그인 화면으로 돌아가기'}"><span aria-hidden="true">←</span><span>${en?'Back to Login':'로그인 화면으로'}</span></button></div>${stepsHtml(4,s)}<div class="mb">${body}</div>
    <div class="mf">${s<4?`${s>1?`<button class="btn btn-s" onclick="MS.step--;renderM()">${en?'Previous':'이전'}</button>`:''}
      <button class="btn btn-p ${ok?'':'btn-dis'}" ${ok?'':'disabled'} aria-disabled="${String(!ok)}" onclick="goNextSignupStep()">${en?'Next':'다음'}</button>`
      :`<button class="btn btn-p" onclick="finishSignupLogin()">${en?'Log In and Get Started':'로그인하고 시작하기'}</button>`}</div>`;
  if(s===2){
    requestAnimationFrame(updateSignupStep2UI);
    if(MS.data.emailCodeSent) requestAnimationFrame(startSignupEmailTimer);
  }
  if(s===3){
    requestAnimationFrame(updateSignupPasswordUI);
    requestAnimationFrame(updateSignupStep3UI);
  }
}

let signupEmailTimerHandle=null;
function formatSignupEmailRemaining(ms){
  const total=Math.max(0,Math.ceil(ms/1000));
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}
function updateSignupEmailTimer(){
  const el=document.getElementById('signupEmailTimer');
  if(!el||!MS||MS.step!==2||!MS.data.emailCodeSent){
    if(signupEmailTimerHandle){clearInterval(signupEmailTimerHandle);signupEmailTimerHandle=null;}
    return;
  }
  const en=MS.data.signupLang==='en';
  const remain=(MS.data.emailCodeExpiresAt||0)-Date.now();
  if(remain<=0){
    MS.data.emailCodeSent=false;
    MS.data.emailVerified=false;
    MS.data.emailCode='';
    MS.data.emailCodeExpiresAt=0;
    if(signupEmailTimerHandle){clearInterval(signupEmailTimerHandle);signupEmailTimerHandle=null;}
    toast(en?'The verification code has expired.':'인증번호 유효시간이 만료되었습니다.');
    renderMPreserveScroll();
    return;
  }
  el.textContent=(en?'Valid for ':'유효시간 ')+formatSignupEmailRemaining(remain);
}
function startSignupEmailTimer(){
  if(signupEmailTimerHandle) clearInterval(signupEmailTimerHandle);
  updateSignupEmailTimer();
  signupEmailTimerHandle=setInterval(updateSignupEmailTimer,1000);
}

function isSignupStep2Ready(){
  return !!(MS&&MS.data&&MS.data.emailVerified);
}
function updateSignupStep2UI(){
  if(!MS||MS.step!==2)return;
  const btn=document.querySelector('#modal .mf .btn-p');
  const ready=isSignupStep2Ready();
  if(btn){
    btn.disabled=!ready;
    btn.setAttribute('aria-disabled',String(!ready));
    btn.classList.toggle('btn-dis',!ready);
  }
}

function getSignupBirthYearOptions(selected,en=false){
  const currentYear=new Date().getFullYear();
  const latest=currentYear-19;
  const oldest=1900;
  let html=`<option value="">${en?'Select year':'연도 선택'}</option>`;
  for(let year=latest;year>=oldest;year--){
    html+=`<option value="${year}" ${String(selected)===String(year)?'selected':''}>${year}</option>`;
  }
  return html;
}
function sanitizeSignupDatePart(value,max){
  let digits=String(value||'').replace(/[^0-9]/g,'').slice(0,2);
  if(!digits)return '';
  const number=Number(digits);
  if(number>max)return String(max);
  return digits;
}
function normalizeSignupDatePart(input,key,max){
  let value=sanitizeSignupDatePart(input.value,max);
  const number=Number(value);
  if(!value||number<1){
    value='';
  }else{
    value=String(number).padStart(2,'0');
  }
  input.value=value;
  MS.data[key]=value;
  syncSignupBirthDate();
  updateSignupStep3UI();
}
function syncSignupBirthDate(){
  const y=String(MS.data.birthYear||'');
  const m=String(MS.data.birthMonth||'').padStart(2,'0');
  const d=String(MS.data.birthDay||'').padStart(2,'0');
  MS.data.bd=(y&&MS.data.birthMonth&&MS.data.birthDay)?`${y}${m}${d}`:'';
}
function isValidSignupBirthDate(){
  const y=Number(MS.data.birthYear);
  const m=Number(MS.data.birthMonth);
  const d=Number(MS.data.birthDay);
  if(!y||!m||!d||m<1||m>12||d<1||d>31)return false;
  const date=new Date(y,m-1,d);
  if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)return false;
  const today=new Date();
  let age=today.getFullYear()-y;
  const birthdayPassed=(today.getMonth()>(m-1))||(today.getMonth()===(m-1)&&today.getDate()>=d);
  if(!birthdayPassed)age--;
  return age>=19;
}
function updateSignupStep3UI(){
  if(!MS||MS.step!==3)return;
  const msg=document.getElementById('phoneMatchMessage');
  const has=!!MS.data.hpConfirm;
  const same=has&&MS.data.hp===MS.data.hpConfirm;
  if(msg){
    msg.textContent=has?(same?'휴대전화번호가 일치합니다.':'휴대전화번호가 일치하지 않습니다.'):'';
    msg.classList.toggle('ok',same);
    msg.classList.toggle('bad',has&&!same);
  }
  const btn=document.querySelector('#modal .mf .btn-p');
  if(btn){
    btn.disabled=false;
    btn.removeAttribute('disabled');
    btn.setAttribute('aria-disabled','false');
    btn.classList.remove('btn-dis');
  }
}

function checkSignupIdAvailability(){
  if(!MS || !MS.data) return;
  const en=MS.data.signupLang==='en';
  const id=String(MS.data.uid||'').trim();

  if(!id){
    MS.data.uidChecked=false;
    toast(en?'Please enter an ID.':'아이디를 입력해 주세요.');
    return;
  }

  if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/.test(id)){
    MS.data.uidChecked=false;
    toast(en?'Use a combination of letters and numbers.':'영문과 숫자를 조합해 입력해 주세요.');
    return;
  }

  MS.data.uidChecked=true;
  toast(en?'This ID is available.':'사용 가능한 아이디입니다.');
  renderMPreserveScroll();
}

function getSignupPasswordState(password){
  const pw=String(password||'');
  const categories=[/[A-Z]/.test(pw),/[a-z]/.test(pw),/[0-9]/.test(pw),/[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const lengthOk=(categories>=2&&pw.length>=10)||(categories>=3&&pw.length>=8);
  const typesOk=categories>=3;
  const compact=pw.toLowerCase().replace(/\s/g,'');
  const repeated=/(.)\1{2,}/.test(compact);
  const sequenceTokens=['0123','1234','2345','3456','4567','5678','6789','7890','9876','8765','7654','6543','5432','4321','3210','abcd','bcde','cdef','defg','qwer','wert','asdf','sdfg','zxcv','xcvb'];
  const sequence=sequenceTokens.some(v=>compact.includes(v));
  const birth=String((MS&&MS.data&&MS.data.bd)||'').replace(/\D/g,'');
  const phone=String((MS&&MS.data&&MS.data.hp)||'').replace(/\D/g,'');
  const digits=pw.replace(/\D/g,'');
  const containsPersonal=(birth.length>=6&&digits.includes(birth))||(phone.length>=8&&digits.includes(phone));
  const weakOk=!!pw&&!repeated&&!sequence&&!containsPersonal;
  return {categories,lengthOk,typesOk,weakOk,valid:lengthOk&&typesOk&&weakOk};
}
function isSignupPasswordValid(password){return getSignupPasswordState(password).valid;}
function updateSignupPasswordUI(){
  if(!MS||MS.step!==3)return;
  const state=getSignupPasswordState(MS.data.pw||'');
  const setRule=(id,ok)=>{const el=document.getElementById(id);if(el)el.classList.toggle('ok',!!ok);};
  setRule('pwRuleLength',state.lengthOk);
  setRule('pwRuleTypes',state.typesOk);
  setRule('pwRuleWeak',state.weakOk);
  const match=document.getElementById('pwMatchMessage');
  if(match){
    const hasConfirm=!!MS.data.pwConfirm;
    const same=hasConfirm&&MS.data.pw===MS.data.pwConfirm;
    const en=MS.data.signupLang==='en';
    match.textContent=hasConfirm?(same?(en?'The passwords match.':'비밀번호가 일치합니다.'):(en?'The passwords do not match.':'비밀번호가 일치하지 않습니다.')):'';
    match.classList.toggle('ok',same);
    match.classList.toggle('bad',hasConfirm&&!same);
  }
  const btn=document.querySelector('#modal .mf .btn-p');
  const ready=!!(MS.data.uidChecked&&state.valid&&MS.data.pw===MS.data.pwConfirm);
  if(btn){btn.disabled=!ready;btn.setAttribute('aria-disabled',String(!ready));btn.classList.toggle('btn-dis',!ready);}
}

function focusSignupField(el,msg){
  if(msg) alert(msg);
  if(el){
    el.scrollIntoView({behavior:'smooth',block:'center'});
    try{el.focus();}catch(e){}
  }
}
function getSignupStep3Target(type){
  const modal=document.getElementById('modal');
  if(!modal)return null;
  const byLabel=(keyword)=>{
    const labels=[...modal.querySelectorAll('.fl,.section-label,.option-title,.signup-section-title')];
    const label=labels.find(el=>(el.textContent||'').replace(/\s/g,'').includes(keyword.replace(/\s/g,'')));
    return label ? (label.closest('.fg,.signup-section,.option-section') || label) : null;
  };
  const inputs=[...modal.querySelectorAll('input.fi,select.fi,textarea.fi')];

  if(type==='name') return inputs.find(el=>el.autocomplete==='name'||(el.placeholder||'').includes('이름'))||byLabel('이름');
  if(type==='birthYear') return modal.querySelector('select[aria-label="출생연도"]')||byLabel('생년월일');
  if(type==='birthMonth') return modal.querySelector('input[aria-label="출생월"]')||byLabel('생년월일');
  if(type==='birthDay') return modal.querySelector('input[aria-label="출생일"]')||byLabel('생년월일');
  if(type==='gender') return modal.querySelector('.signup-gender-option,.gender-option')||byLabel('성별');
  if(type==='phone') return modal.querySelector('input[autocomplete="tel"]')||byLabel('휴대전화');
  if(type==='phoneConfirm') return inputs.find(el=>(el.placeholder||'').includes('다시 입력')&&el.inputMode==='numeric')||byLabel('휴대전화');
  if(type==='uid') return inputs.find(el=>(el.placeholder||'').includes('영문·숫자')||(el.placeholder||'').includes('아이디'))||byLabel('아이디');
  if(type==='password') return document.getElementById('signupPassword')||byLabel('비밀번호');
  if(type==='passwordConfirm') return document.getElementById('signupPasswordConfirm')||byLabel('비밀번호 확인');
  if(type==='affiliation') return byLabel('소속');
  if(type==='purposes') return byLabel('가입목적');
  if(type==='interestFields') return byLabel('관심분야');
  if(type==='interestProjects') return byLabel('관심사업');
  if(type==='awarenessRoutes') return byLabel('인지경로')||byLabel('재단 인지 경로');
  return null;
}
function alertAndFocusSignupStep3(message,type){
  alert(message);
  const target=getSignupStep3Target(type);
  if(!target)return;
  target.scrollIntoView({behavior:'smooth',block:'center'});
  const focusable=target.matches&&target.matches('input,select,textarea,button')
    ? target
    : target.querySelector&&target.querySelector('input,select,textarea,button');
  setTimeout(()=>{try{if(focusable)focusable.focus();}catch(e){}},300);
}
function goNextSignupStep(){
  if(!MS)return;
  const en=MS.data.signupLang==='en';

  if(MS.step===1){
    if(!(MS.data.a0&&MS.data.a1&&MS.data.a2))return;
    MS.step=2;
    renderM();
    return;
  }

  if(MS.step===2){
    if(!MS.data.emailVerified)return;
    MS.step=3;
    renderM();
    return;
  }

  if(MS.step===3){
    const state=getSignupPasswordState(MS.data.pw||'');

    if(!String(MS.data.nm||'').trim())
      return alertAndFocusSignupStep3((en?'Please enter your name.':'이름을 입력해 주세요.'),'name');
    if(!MS.data.birthYear)
      return alertAndFocusSignupStep3((en?'Please select your birth year.':'출생연도를 선택해 주세요.'),'birthYear');
    if(!MS.data.birthMonth)
      return alertAndFocusSignupStep3((en?'Please enter your birth month.':'출생월을 입력해 주세요.'),'birthMonth');
    if(!MS.data.birthDay)
      return alertAndFocusSignupStep3((en?'Please enter your birth day.':'출생일을 입력해 주세요.'),'birthDay');
    if(!isValidSignupBirthDate())
      return alertAndFocusSignupStep3((en?'Please enter a valid date of birth. You must be at least 19 years old.':'생년월일을 정확히 입력해 주세요. 만 만 19세 이상만 가입할 수 있습니다.'),'birthYear');
    if(!MS.data.gender)
      return alertAndFocusSignupStep3((en?'Please select your gender.':'성별을 선택해 주세요.'),'gender');
    if(!/^01\d{8,9}$/.test(String(MS.data.hp||'')))
      return alertAndFocusSignupStep3((en?'Please enter a valid mobile phone number.':'휴대전화번호를 정확히 입력해 주세요.'),'phone');
    if(!MS.data.hpConfirm)
      return alertAndFocusSignupStep3((en?'Please re-enter your mobile phone number.':'휴대전화번호를 다시 입력해 주세요.'),'phoneConfirm');
    if(MS.data.hp!==MS.data.hpConfirm)
      return alertAndFocusSignupStep3((en?'The phone numbers do not match.':'휴대전화번호가 일치하지 않습니다.'),'phoneConfirm');
    if(!String(MS.data.uid||'').trim())
      return alertAndFocusSignupStep3((en?'Please enter an ID.':'아이디를 입력해 주세요.'),'uid');
    if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/.test(String(MS.data.uid||'')))
      return alertAndFocusSignupStep3((en?'Use a combination of letters and numbers.':'영문과 숫자를 조합해 입력해 주세요.'),'uid');
    if(!MS.data.uidChecked)
      return alertAndFocusSignupStep3((en?'Please complete the ID availability check.':'아이디 중복확인을 완료해 주세요.'),'uid');
    if(!state.valid){
      updateSignupPasswordUI();
      return alertAndFocusSignupStep3((en?'Please review the password requirements.':'비밀번호 설정 규칙을 확인해 주세요.'),'password');
    }
    if(!MS.data.pwConfirm)
      return alertAndFocusSignupStep3((en?'Please re-enter your password.':'비밀번호를 다시 입력해 주세요.'),'passwordConfirm');
    if(MS.data.pw!==MS.data.pwConfirm){
      updateSignupPasswordUI();
      return alertAndFocusSignupStep3((en?'The passwords do not match.':'비밀번호 확인이 일치하지 않습니다.'),'passwordConfirm');
    }
    if(!MS.data.affiliation)
      return alertAndFocusSignupStep3((en?'Please select your affiliation.':'소속을 선택해 주세요.'),'affiliation');
    if(!(MS.data.purposes||[]).length)
      return alertAndFocusSignupStep3((en?'Please select at least one purpose of membership.':'가입목적을 1개 이상 선택해 주세요.'),'purposes');
    if(!(MS.data.interestFields||[]).length)
      return alertAndFocusSignupStep3((en?'Please select at least one area of interest.':'관심분야를 1개 이상 선택해 주세요.'),'interestFields');
    if(!(MS.data.interestProjects||[]).length)
      return alertAndFocusSignupStep3((en?'Please select at least one foundation program of interest.':'관심사업을 1개 이상 선택해 주세요.'),'interestProjects');
    if(!(MS.data.awarenessRoutes||[]).length)
      return alertAndFocusSignupStep3((en?'Please select at least one way you heard about NCCF.':'재단 인지 경로를 1개 이상 선택해 주세요.'),'awarenessRoutes');

    MS.step=4;
    renderM();
    return;
  }
}

// ═══ RECEIPT ═══

// ═══ HELPERS ═══
function mHead(t,back){
  return `<div class="mh">${back?`<button class="mh-btn" onclick="MS.step--;renderM()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>`:'<div style="width:30px"></div>'}
    <div class="mh-t">${t}</div>
    <button class="mh-btn" onclick="closeM()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>`;
}
function stepsHtml(n,c){let h='<div class="steps">';for(let i=1;i<=n;i++){h+=`<div class="sd ${i<c?'ok':i===c?'on':''}">${i<c?'✓':i}</div>`;if(i<n)h+=`<div class="sl ${i<c?'ok':''}"></div>`;}return h+'</div>';}

function showAgreement(type,en){
  const data={
    terms:{ko:['멤버십 이용약관','엔씨문화재단 회원 서비스 이용을 위한 기본 약관입니다. 계정 생성, 로그인, 마이페이지, 기부 신청 등 회원 기능 이용 기준을 안내합니다.','회원은 본인 계정 정보를 안전하게 관리해야 하며, 타인의 정보를 이용하거나 부정한 목적으로 서비스를 이용할 수 없습니다.'],en:['Terms of Service','These terms define the basic rules for using NC Cultural Foundation membership services, including account creation, login, My Page, and donation requests.','Members must manage their account information securely and may not use another person’s information or use the service for improper purposes.']},
    privacy:{ko:['개인정보 수집·이용 동의'],en:['Collection and Use of Personal Information','We collect and use the personal information required to operate and manage the membership. Please review the details before agreeing.','You may refuse consent, but membership registration may be restricted.']},
    marketing:{ko:['광고 및 마케팅 목적 활용'],en:['Marketing Information','You may receive optional information such as foundation news, campaigns, programs, donation updates, and newsletters by email or SMS.','Membership registration and basic service use are not restricted even if you do not consent.']},
    thirdParty:{ko:['제3자 정보 제공','사업 운영 또는 법령상 필요한 경우에 한해 사전에 고지된 범위 내에서 개인정보를 제3자에게 제공할 수 있습니다.','제공 대상, 항목, 목적, 보유기간은 실제 제공이 필요한 시점에 별도로 안내합니다.'],en:['Third-party Information Provision','Personal information may be provided to third parties only within the notified scope when necessary for business operation or legal compliance.','Recipient, provided items, purpose, and retention period will be separately notified when provision is required.']},
    location:{ko:['위치정보 수집','위치 기반 안내 또는 서비스 개선이 필요한 경우에 한해 위치정보를 선택적으로 수집할 수 있습니다.','동의하지 않아도 일반 회원 기능은 이용할 수 있습니다.'],en:['Location Information Collection','Location information may be optionally collected only when location-based guidance or service improvement is required.','You can still use general membership functions without consenting.']}
  };
  const item=(data[type]||data.terms)[en?'en':'ko'];
  const old=document.getElementById('termsPop'); if(old) old.remove();
  const el=document.createElement('div'); el.id='termsPop'; el.className='terms-pop';
  const agreeButton=`<div class="terms-actions"><button type="button" class="terms-agree-btn" onclick="agreeFromAgreement('${type}')">${en?'I agree.':'동의합니다.'}</button></div>`;
  if(type==='privacy' && !en){
    el.innerHTML=`<div class="terms-card"><div class="terms-head"><span>개인정보 수집·이용 동의</span><button class="terms-close" onclick="document.getElementById('termsPop').remove()">×</button></div><div class="terms-body">
      <p>(재)엔씨문화재단(이하‘재단’)의 개인정보 처리에 관한 자세한 사항은 홈페이지에 공개하고 있는 <a href="https://www.ncfoundation.or.kr/policy" target="_blank" rel="noopener noreferrer" style="font-weight:800;text-decoration:underline;color:inherit">"개인정보 처리방침"</a>을 참고하시기 바랍니다.</p>
      <h4>1. 수집하는 개인정보의 항목</h4>
      <p>- [필수]아이디, 이름, 이메일, 전화번호, 생년월일, 주소, 관심분야/가입모듈<br>- [선택]소속, 직책</p>
      <h4>2. 개인정보 처리 목적</h4>
      <p>재단은 멤버십 운영 및 관리를 위해 수집한 개인정보를 다음의 목적을 위해 활용합니다.<br>- 회원 가입 승인·관리, 이용자 식별, 뉴스레터 및 고지사항 전달, 회원 혜택(물품 등) 배송<br>- (마케팅 수신 동의자에 한함)이벤트·프로모션 등 광고성 정보 전달 및 마케팅 활용</p>
      <h4>3. 개인정보 처리 및 보유 기간</h4>
      <p>개인정보의 처리 및 보유기간은 원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.<br>단, 관계법령의 규정에 의하여 수집 및 이용목적 달성 후에도 보존할 필요가 있는 경우 재단은 아래와 같이 관계법령에서 정한 일정한 기간 동안 이용자의 정보를 보관합니다.</p>
      <p style="font-size:calc(1em + 2pt);font-weight:800;text-decoration:underline;text-underline-offset:3px">- 회원 탈퇴 시 파기</p>
      <p>귀하는 이와 같은 개인정보 수집 및 이용에 동의하지 않으실 수 있습니다. 단, 동의 거부 시 멤버십 가입 신청이 제한됩니다.</p>
      ${agreeButton}
    </div></div>`;
  }else if(type==='privacy' && en){
    el.innerHTML=`<div class="terms-card"><div class="terms-head"><span>Consent to the Collection and Use of Personal Information</span><button class="terms-close" onclick="document.getElementById('termsPop').remove()">×</button></div><div class="terms-body">
      <p>For further details regarding the processing of personal information by the NC Cultural Foundation (the “Foundation”), please refer to the <a href="https://www.ncfoundation.or.kr/policy" target="_blank" rel="noopener noreferrer" style="font-weight:800;text-decoration:underline;color:inherit">Privacy Policy</a> published on the Foundation’s website.</p>
      <h4>1. Personal Information Collected</h4>
      <p>- [Required] ID, name, email address, telephone number, date of birth, address, areas of interest/modules joined<br>- [Optional] Organization, job title</p>
      <h4>2. Purpose of Processing Personal Information</h4>
      <p>The Foundation uses the collected personal information for membership operation and management for the following purposes:<br>- Membership approval and management, user identification, delivery of newsletters and notices, and shipment of membership benefits such as goods<br>- For members who consent to marketing communications only: delivery of advertising information, including events and promotions, and other marketing activities</p>
      <h4>3. Processing and Retention Period</h4>
      <p>In principle, personal information is destroyed without delay once the purpose of collection and use has been achieved. However, when retention is required under applicable laws and regulations, the Foundation retains the information for the period prescribed by such laws.</p>
      <p style="font-size:calc(1em + 2pt);font-weight:800;text-decoration:underline;text-underline-offset:3px">- Destroyed upon membership withdrawal</p>
      <p>You may refuse to consent to the collection and use of personal information. However, refusal may restrict your membership application.</p>
      ${agreeButton}
    </div></div>`;
  }else if(type==='marketing' && !en){
    el.innerHTML=`<div class="terms-card"><div class="terms-head"><span>광고 및 마케팅 목적 활용 동의 안내</span><button class="terms-close" onclick="document.getElementById('termsPop').remove()">×</button></div><div class="terms-body">
      <p>회원님께 보다 나은, 서비스와 다양한 혜택 정보를 제공하기 위하여,<br>개인정보 처리방침과 별도로 연락처 정보(이메일, 전화번호)를 광고 및 마케팅 목적으로 이용하고자 합니다.</p>
      <p>아래 내용을 확인하시고 동의 여부를 선택해 주시기 바랍니다.</p>
      <h4>1. 수집 및 이용 항목</h4><p>- 이메일, 전화번호</p>
      <h4>2. 이용 목적</h4><p>- 이벤트·프로모션 등 광고성 정보 전달 및 마케팅 활용</p>
      <h4>3. 보유 및 이용 기간</h4>
      <p><span style="font-size:calc(1em + 2pt);font-weight:800;text-decoration:underline;text-underline-offset:3px">마이페이지 &gt; 회원정보 변경 &gt; 광고 및 마케팅 목적 활용 동의에서 동의를 철회하거나 회원 탈퇴 시, 광고 및 마케팅 목적의 활용은 즉시 중지됩니다.</span></p>
      <h4>4. 동의 거부권 안내</h4><p>회원님께서는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.<br>다만, 동의하지 않으실 경우 이벤트 및 혜택 안내 등 마케팅 관련 서비스를 제공받을 수 없습니다.<br>※ 동의하지 않더라도 멤버십 가입 및 기본 서비스 이용에는 제한이 없습니다.</p>
      ${agreeButton}
    </div></div>`;
  }else if(type==='marketing' && en){
    el.innerHTML=`<div class="terms-card"><div class="terms-head"><span>Consent to Use Personal Information for Advertising and Marketing</span><button class="terms-close" onclick="document.getElementById('termsPop').remove()">×</button></div><div class="terms-body">
      <p>To provide members with better services and information about various benefits, the Foundation intends to use contact information (email address and telephone number) for advertising and marketing purposes separately from the Privacy Policy.</p>
      <p>Please review the following information and indicate whether you consent.</p>
      <h4>1. Information Collected and Used</h4><p>- Email address, telephone number</p>
      <h4>2. Purpose of Use</h4><p>- Delivery of advertising information, including events and promotions, and other marketing activities</p>
      <h4>3. Retention and Use Period</h4>
      <p><span style="font-size:calc(1em + 2pt);font-weight:800;text-decoration:underline;text-underline-offset:3px">You may withdraw consent through My Page &gt; Edit Member Information &gt; Advertising and Marketing Consent. Upon withdrawal of consent or membership withdrawal, use of the information for advertising and marketing purposes will cease immediately.</span></p>
      <h4>4. Right to Refuse Consent</h4><p>You have the right to refuse consent to the collection and use of personal information.<br>If you do not consent, marketing-related services such as event and benefit notifications will not be provided.<br>※ Refusal does not restrict membership registration or use of basic services.</p>
      ${agreeButton}
    </div></div>`;
  }else{
    el.innerHTML=`<div class="terms-card"><div class="terms-head"><span>${item[0]}</span><button class="terms-close" onclick="document.getElementById('termsPop').remove()">×</button></div><div class="terms-body"><h4>${en?'Summary':'주요 안내'}</h4><p>${item[1]}</p><h4>${en?'Additional Information':'추가 안내'}</h4><p>${item[2]}</p>${agreeButton}</div></div>`;
  }
  el.onclick=e=>{if(e.target===el)el.remove()};
  document.body.appendChild(el);
}

function agreeFromAgreement(type){
  const consentKey={terms:'a1',privacy:'a2',marketing:'a4',thirdParty:'a3',location:'a5'}[type];
  if(consentKey) MS.data[consentKey]=true;
  MS.data.aa=!!(MS.data.a0&&MS.data.a1&&MS.data.a2&&MS.data.a4);
  const pop=document.getElementById('termsPop');
  if(pop) pop.remove();
  renderMPreserveScroll();
}

function renderMPreserveScroll(){
  const mb=document.querySelector('#modal .mb');
  const keepScroll=mb?mb.scrollTop:0;
  renderM();
  requestAnimationFrame(()=>{const next=document.querySelector('#modal .mb'); if(next) next.scrollTop=keepScroll;});
}

function toggleMulti(group,value, el){
  if(!MS.data[group]) MS.data[group]=[];
  const i=MS.data[group].indexOf(value);
  const on=i<0;
  if(i>=0) MS.data[group].splice(i,1); else MS.data[group].push(value);
  if(el) el.classList.toggle('on', on);
  renderMPreserveScroll();
}

function tgAll(){const v=!MS.data.aa;MS.data.aa=v;MS.data.a0=v;MS.data.a1=v;MS.data.a2=v;MS.data.a4=v;renderMPreserveScroll();}
function syncA(){MS.data.aa=!!(MS.data.a0&&MS.data.a1&&MS.data.a2&&MS.data.a4);}
function tgP(t){if(!MS.data.pp)MS.data.pp=[];const i=MS.data.pp.indexOf(t);if(i>=0)MS.data.pp.splice(i,1);else MS.data.pp.push(t);renderM();}
function togglePausePeriod(){
  const box=document.getElementById('pausePeriodBox');
  if(box) box.classList.toggle('on');
}
function toggleEditPauseBox(){
  const box=document.getElementById('editPausePeriodBox');
  if(box) box.classList.toggle('on');
}
function confirmDonationAction(type){
  const msg = type==='cancel' ? '정기기부 취소 신청이 접수되었습니다' : '정기기부 일시정지 신청이 접수되었습니다';
  toast(msg);
}
function toast(msg){const t=document.getElementById('toastEl');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800);}

function closeNotifications(){const n=document.getElementById('notifyPop'); if(n) n.remove();}
function toggleNotifications(e){
  if(e) e.stopPropagation();
  const ex=document.getElementById('notifyPop');
  if(ex){ex.remove();return;}
  const wrap=document.createElement('div');
  wrap.className='notify-pop';
  wrap.id='notifyPop';
  wrap.innerHTML=`<div class="notify-head"><strong>알림</strong><button class="notify-close" onclick="closeNotifications()">×</button></div>
    <div class="notify-list"></div>
      <div class="notify-item"><div class="notify-dot" style="background:#777"></div><div><div class="notify-title">정기기부 결제 예정</div><div class="notify-desc">나의AAC 정기기부 30,000원이 6월 5일 결제 예정입니다.</div><div class="notify-time">오늘 09:20</div></div></div>
      <div class="notify-item"><div class="notify-dot" style="background:#777"></div><div><div class="notify-title">창의성 교육 소식 업데이트</div><div class="notify-desc">관심 분야로 선택한 창의성 교육 관련 신규 프로그램 안내가 등록되었습니다.</div><div class="notify-time">어제</div></div></div>
      <div class="notify-item"><div class="notify-dot" style="background:#777"></div><div><div class="notify-title">개인정보 동의 현황 안내</div><div class="notify-desc">광고 및 마케팅 목적 활용 동의 <span style="display:block;margin-top:4px;font-size:11px;color:#777;font-weight:400">동의 또는 철회 시 등록된 휴대전화번호로 문자 메시지가 발송됩니다.</span> 상태를 언제든 마이페이지에서 변경할 수 있습니다.</div><div class="notify-time">3일 전</div></div></div>
    </div>`;
  document.body.appendChild(wrap);
}
document.addEventListener('click', function(ev){
  const pop=document.getElementById('notifyPop');
  if(pop && !pop.contains(ev.target) && !ev.target.closest('.top-bell')) pop.remove();
});

function scrollToTop(){
  window.scrollTo({top:0,behavior:'smooth'});
}

// ═══ INIT ═══
renderBanner();

function updateSignupConsentFooter(){
  const modal=document.getElementById('modal');
  if(!modal || !MS || MS.mode!=='signup' || MS.step!==1) return;
  const ok=!!(MS.data.a0 && MS.data.a1 && MS.data.a2);
  const next=modal.querySelector('.mf .btn-p');
  if(next){
    next.classList.toggle('btn-dis', !ok);
    next.disabled=!ok;
    next.setAttribute('aria-disabled', ok?'false':'true');
  }
}
function toggleSignupConsent(key){
  if(!MS.data) MS.data={};
  MS.data[key]=!MS.data[key];
  MS.data.aa=!!(MS.data.a0&&MS.data.a1&&MS.data.a2&&MS.data.a4);
  renderMPreserveScroll();
}
function tgAll(){
  if(!MS.data) MS.data={};
  const requiredAll=!!(MS.data.a0&&MS.data.a1&&MS.data.a2);
  const optional=!!MS.data.a4;
  const v=!(requiredAll&&optional);
  MS.data.aa=v;
  MS.data.a0=v;
  MS.data.a1=v;
  MS.data.a2=v;
  MS.data.a4=v;
  renderMPreserveScroll();
}
document.addEventListener('click',function(e){
  const target=e.target.closest && e.target.closest('#modal .consent-check, #modal .option-card');
  if(target){ e.preventDefault(); }
}, true);
const BENEFIT_DETAIL_DATA={
  newsletter:{title:'재단 정기 뉴스레터 발송 및 주요 사업 정보 제공',summary:'재단의 주요 소식, 프로그램 모집, 공연·전시 정보를 정기적으로 받아볼 수 있습니다.',target:'가치지음 멤버십 회원',period:'상시 제공',method:'이메일·문자 안내'},
  stage100:{title:"대학로 'STAGE 100' 연극제 50% 할인 혜택",summary:"가치지음 멤버십 회원에게 STAGE 100 연극제 티켓 50% 할인 혜택을 제공합니다.",target:'가치지음 멤버십 회원',period:'연극제 티켓 오픈 기간',method:'회원 인증 후 할인 적용'},
  performance:{title:'재단 주관 공연/전시/행사 우선 등록 및 할인 혜택',summary:'재단이 주관하는 공연과 전시 프로그램의 우선 신청 기회와 할인 혜택을 제공합니다.',target:'가치지음 멤버십 회원',period:'프로그램별 상이',method:'멤버십 전용 안내'},
  event:{title:'재단 사업 관련 행사 우선 등록 및 할인 혜택',summary:'세미나, 북토크 등 재단 사업 관련 행사에 우선 등록할 수 있으며 일부 행사는 할인 혜택이 제공됩니다.',target:'가치지음 멤버십 회원',period:'행사별 상이',method:'사전 신청'},
  projectory:{title:"청소년 창의 공간 '프로젝토리' 공간 투어 초대",summary:'청소년 창의 공간 프로젝토리의 공간 투어에 연 2회 초대합니다.',target:'가치지음 멤버십 회원',period:'연 2회',method:'초대 신청'},
  rental:{title:'재단 공연 및 전시 공간 대관비용 할인 혜택',summary:'재단 공연장(B1F) 및 전시 공간(2F) 대관 시 조건 협의를 통해 할인 혜택을 제공합니다.',target:'가치지음 멤버십 회원',period:'대관 협의 시',method:'별도 문의'}
};
function openBenefitDetail(key){
  const d=BENEFIT_DETAIL_DATA[key]||BENEFIT_DETAIL_DATA.stage100;
  const old=document.getElementById('benefitPop'); if(old) old.remove();
  const isStage=key==='stage100';
  const pop=document.createElement('div');
  pop.id='benefitPop'; pop.className='benefit-pop';
  pop.innerHTML=`<div class="benefit-pop-card" role="dialog" aria-modal="true" aria-label="혜택 상세">
    <div class="benefit-pop-head"><div class="benefit-pop-title">${d.title}</div><button type="button" class="benefit-pop-close" onclick="closeBenefitDetail()">×</button></div>
    <div class="benefit-pop-body">
      ${isStage?`<div class="stage-visual" aria-label="STAGE 100 연극제 할인 혜택 이미지"><div class="stage-poster-copy"><div class="stage-poster-kicker">VALUEJIEUM MEMBERSHIP</div><div class="stage-poster-title">STAGE 100</div><div class="stage-poster-desc">연극제 티켓 할인 혜택</div></div></div>`:`<div class="stage-visual" aria-label="가치지음 멤버십 혜택 이미지"><div class="stage-poster-copy"><div class="stage-poster-kicker">VALUEJIEUM MEMBERSHIP</div><div class="stage-poster-title">BENEFIT</div><div class="stage-poster-desc">가치지음 회원 전용 혜택</div></div></div>`}
      <p style="font-size:16px;line-height:1.75;color:#333;margin:0 0 14px">${d.summary}</p>
      <div class="benefit-info-grid">
        <div class="benefit-info-box"><strong>대상</strong><span>${d.target}</span></div>
        <div class="benefit-info-box"><strong>기간</strong><span>${d.period}</span></div>
        <div class="benefit-info-box"><strong>이용방법</strong><span>${d.method}</span></div>
      </div>
      <div class="benefit-pop-note">본 화면은 데모용 예시입니다. 실제 제공 범위, 신청 방식, 할인율, 운영 일정은 최종 멤버십 정책에 따라 조정될 수 있습니다.</div>
    </div>
  </div>`;
  pop.addEventListener('click',e=>{if(e.target===pop)closeBenefitDetail();});
  document.body.appendChild(pop);
}
function closeBenefitDetail(){const pop=document.getElementById('benefitPop'); if(pop) pop.remove();}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeBenefitDetail();});

;

(function(){
  function syncMembershipTopLogout(){
    const btn=document.getElementById('membershipTopLogout');
    if(btn) btn.hidden=!loggedIn;
  }
  window.showMembershipLogin=function(){
    setMembershipPageTitle(false);
    syncMembershipTopLogout();
    MS={mode:null,step:1,data:{},mpTab:'info'};
    const root=document.getElementById('membershipPageView');
    if(!root)return;
    root.className='';
    root.innerHTML=`
      <div class="membership-login-intro" aria-label="가치지음 멤버십 안내">
        <strong>함께 만드는 가치, 이어지는 경험.</strong>
        <span>가치지음 멤버십에서 NC문화재단의 다양한 활동을 만나보세요.</span>
      </div>
      <section class="membership-login-panel" aria-label="멤버십 로그인">
        <h1 class="membership-login-title">로그인</h1>
        <div class="fg"><label class="fl" for="membershipLoginId">아이디 또는 이메일</label><input class="fi" id="membershipLoginId" autocomplete="username" placeholder="아이디 또는 이메일 주소를 입력해 주세요" value="nccfmember"></div>
        <div class="fg"><label class="fl" for="membershipLoginPw">비밀번호</label><input class="fi" id="membershipLoginPw" type="password" autocomplete="current-password" placeholder="비밀번호를 입력해 주세요" value="password"></div>
        <div class="membership-login-options">
          <label class="membership-keep-login">
            <input type="checkbox" id="membershipKeepLogin">
            <span class="membership-keep-box" aria-hidden="true"></span>
            <span>로그인 상태 유지</span>
          </label>
          <p class="membership-privacy-alert">※ 개인정보 보호를 위해 공용 PC에서는 ‘로그인 상태 유지’를 선택하지 마시고, 사용 후 반드시 로그아웃하시기 바랍니다.</p>
        </div>
        <button class="membership-login-submit" type="button" onclick="membershipPageLogin()">로그인</button>
        <div class="membership-login-links">
          <button type="button" onclick="showMembershipSignup()">회원가입</button>
          <button type="button" onclick="toast('아이디 찾기 기능 준비 중')">아이디 찾기</button>
          <button type="button" onclick="toast('비밀번호 찾기 기능 준비 중')">비밀번호 찾기</button>
        </div>
      </section>`;
  };
  window.setMembershipPageTitle=function(isMypage){
    const title=document.querySelector('.membership-page-title');
    if(title) title.textContent=isMypage
      ? 'NC문화재단 가치지음 멤버십'
      : 'NC문화재단 가치지음 멤버십';
  };
  window.showMembershipSignup=function(){
    setMembershipPageTitle(false);
    MS={mode:'signupPage',step:1,data:{},mpTab:'info'};
    renderM();
    window.scrollTo({top:0,behavior:'smooth'});
  };
  window.membershipPageLogin=function(){
    const id=(document.getElementById('membershipLoginId')?.value||'').trim();
    const pw=(document.getElementById('membershipLoginPw')?.value||'').trim();
    const keepLogin=!!document.getElementById('membershipKeepLogin')?.checked;
    if(!id||!pw){toast('아이디 또는 이메일 주소와 비밀번호를 입력해 주세요.');return;}
    loggedIn=true;
    syncMembershipTopLogout();
    try{
      if(keepLogin){
        localStorage.setItem('nccfMembershipLogin','true');
        sessionStorage.removeItem('nccfMembershipLogin');
      }else{
        sessionStorage.setItem('nccfMembershipLogin','true');
        localStorage.removeItem('nccfMembershipLogin');
      }
    }catch(e){}
    renderBanner();
    toast(keepLogin?'로그인 상태가 유지됩니다.':USER.name+'님 환영합니다!');
    showMembershipAccount();
  };
  window.showMembershipMypage=function(){
    syncMembershipTopLogout();
    setMembershipPageTitle(true);
    MS={mode:'mypagePage',step:1,data:{},mpTab:'info'};
    renderM();
    window.scrollTo({top:0,behavior:'smooth'});
  };
  window.showMembershipAccount=function(){
    showMembershipMypage();
  };
  try{
    loggedIn=localStorage.getItem('nccfMembershipLogin')==='true'||sessionStorage.getItem('nccfMembershipLogin')==='true';
  }catch(e){}
  window.renderMembershipActions=function(){loggedIn?showMembershipAccount():showMembershipLogin();};
  window.goMembershipSite=function(){
    document.body.classList.add('membership-on');
    renderMembershipActions();
    if(location.hash!=='#membership-service')history.pushState({page:'membership-service'},'','#membership-service');
    window.scrollTo({top:0,behavior:'auto'});
  };
  window.goMainSite=function(){
    document.body.classList.remove('membership-on');
    if(location.hash==='#membership-service')history.pushState({page:'main'},'',location.pathname);
    window.scrollTo({top:0,behavior:'auto'});
  };
  window.addEventListener('popstate',function(){
    if(location.hash==='#membership-service'){document.body.classList.add('membership-on');renderMembershipActions();}
    else document.body.classList.remove('membership-on');
  });
  if(location.hash==='#membership-service'){document.body.classList.add('membership-on');renderMembershipActions();}
  const oldLogout=window.doLogout;
  if(typeof oldLogout==='function'){
    window.doLogout=function(){oldLogout.apply(this,arguments);syncMembershipTopLogout();if(document.body.classList.contains('membership-on'))setTimeout(showMembershipLogin,40);};
  }
})();

;

(function(){
  window.toggleSupportPop=function(ev){
    if(ev) ev.stopPropagation();
    const pop=document.getElementById('supportPop');
    if(pop) pop.classList.toggle('open');
  };
  window.openSupportContact=function(){
    const pop=document.getElementById('supportPop');
    if(pop) pop.classList.remove('open');
    toast('문의처: nccf_membership@ncfoundation.or.kr / nccf_donation@ncfoundation.or.kr');
  };
  window.goDonatePage=function(){
    const pop=document.getElementById('supportPop');
    if(pop) pop.classList.remove('open');
    window.open('http://aq.gy/f/XXPeM','_blank','noopener,noreferrer');
  };
  document.addEventListener('click',function(ev){
    const pop=document.getElementById('supportPop');
    if(pop && pop.classList.contains('open') && !pop.contains(ev.target) && !ev.target.closest('.support-float')) pop.classList.remove('open');
  });
})();

;

(function(){
  function closeSupportPop(){ const pop=document.getElementById('supportPop'); if(pop) pop.classList.remove('open'); }
  function updateFloatLabel(text){
    const label=document.getElementById('floatLabelText');
    if(!label) return;
    label.textContent=text || '멤버십 소개';
    const button=label.closest('.support-float');
    if(button) button.setAttribute('aria-label',label.textContent);
  }
  window.showMainHome=function(push){
    document.body.classList.remove('membership-on','value-page');
    closeSupportPop();
    updateFloatLabel('멤버십 소개');
    if(push !== false && location.hash) history.pushState({page:'home'},'', location.pathname);
    window.scrollTo({top:0,behavior:'auto'});
  };
  window.goValuePage=function(){
    document.body.classList.remove('membership-on');
    document.body.classList.add('value-page');
    closeSupportPop();
    updateFloatLabel('멤버십 가입');
    if(location.hash !== '#valuejieum') history.pushState({page:'valuejieum'},'', '#valuejieum');
    window.scrollTo({top:0,behavior:'auto'});
  };
  window.goMembershipSite=function(){
    document.body.classList.remove('value-page');
    document.body.classList.add('membership-on');
    closeSupportPop();
    if(typeof renderMembershipActions==='function') renderMembershipActions();
    if(location.hash !== '#membership-service') history.pushState({page:'membership-service'},'', '#membership-service');
    window.scrollTo({top:0,behavior:'auto'});
  };
  window.goMainSite=function(){ window.showMainHome(true); };
  window.handleFloatingClick=function(ev){
    if(ev) ev.stopPropagation();
    closeSupportPop();
    if(document.body.classList.contains('value-page')){
      window.goMembershipSite();
      return;
    }
    if(document.body.classList.contains('membership-on')) return;
    window.goValuePage();
  };
  window.goDonatePage=function(){ window.open('http://aq.gy/f/XXPeM','_blank','noopener,noreferrer'); };
  window.openSupportContact=function(){ toast('문의처: nccf_membership@ncfoundation.or.kr / nccf_donation@ncfoundation.or.kr'); };
  window.addEventListener('popstate', function(){
    if(location.hash === '#membership-service') window.goMembershipSite();
    else if(location.hash === '#valuejieum') window.goValuePage();
    else window.showMainHome(false);
  });
  document.addEventListener('click',function(ev){
    const pop=document.getElementById('supportPop');
    if(pop && pop.classList.contains('open') && !pop.contains(ev.target) && !ev.target.closest('.support-float')) pop.classList.remove('open');
  });
  if(location.hash === '#membership-service') window.goMembershipSite();
  else if(location.hash === '#valuejieum') window.goValuePage();
  else window.showMainHome(false);
})();

(function(){
  const tabs=Array.from(document.querySelectorAll('.mem-benefit-tab'));
  const panel=document.getElementById('benefitVisual');
  const image=document.getElementById('benefitVisualImage');
  const mobileTitle=document.querySelector('.mem-benefit-mobile-title');
  const mobileCount=document.querySelector('.mem-benefit-mobile-count');
  const prevButton=document.querySelector('.mem-benefit-prev');
  const nextButton=document.querySelector('.mem-benefit-next');
  if(!tabs.length || !panel || !image) return;
  const altTexts=[
    '재단 정기 뉴스레터 및 주요 사업 정보 혜택 이미지',
    "대학로 STAGE 100 연극제 할인 혜택 이미지",
    '재단 주관 공연·전시·행사 우선 등록 및 할인 혜택 이미지',
    '프로젝토리 공간 투어 초대 혜택 이미지',
    '재단 간행물·보고서·교육 자료 제공 혜택 이미지',
    '재단 공연 및 전시 공간 대관 할인 혜택 이미지'
  ];
  function selectTab(tab){
    const index=tabs.indexOf(tab);
    tabs.forEach(function(item){
      const active=item===tab;
      item.classList.toggle('is-active',active);
      item.setAttribute('aria-selected',String(active));
      item.tabIndex=active?0:-1;
    });
    image.src=tab.dataset.benefitImage;
    image.alt=altTexts[index];
    panel.setAttribute('aria-labelledby',tab.id);
    if(mobileTitle) mobileTitle.textContent=tab.textContent.replace(/^\d{2}/,'').trim();
    if(mobileCount) mobileCount.textContent=(index+1)+' / '+tabs.length;
  }
  tabs.forEach(function(tab,index){
    tab.addEventListener('click',function(){ selectTab(tab); });
    tab.addEventListener('keydown',function(event){
      if(!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next=index;
      if(event.key==='Home') next=0;
      else if(event.key==='End') next=tabs.length-1;
      else if(event.key==='ArrowDown' || event.key==='ArrowRight') next=(index+1)%tabs.length;
      else next=(index-1+tabs.length)%tabs.length;
      selectTab(tabs[next]);
      tabs[next].focus();
    });
  });
  if(prevButton) prevButton.addEventListener('click',function(){
    const current=tabs.findIndex(function(tab){ return tab.classList.contains('is-active'); });
    selectTab(tabs[(current-1+tabs.length)%tabs.length]);
  });
  if(nextButton) nextButton.addEventListener('click',function(){
    const current=tabs.findIndex(function(tab){ return tab.classList.contains('is-active'); });
    selectTab(tabs[(current+1)%tabs.length]);
  });
})();

;

document.addEventListener('keydown', function(e){
  const card=e.target && e.target.closest ? e.target.closest('.ms-benefits li[role="button"][data-benefit]') : null;
  if(!card) return;
  if(e.key==='Enter' || e.key===' '){
    e.preventDefault();
    const key=card.getAttribute('data-benefit');
    if(typeof openBenefitDetail==='function') openBenefitDetail(key);
  }
}, true);

;

function openMemberInfoEdit(){
  if(!MS) return;
  if(!MS.data) MS.data={};
  MS.data.editEmail='';
  MS.data.editEmailCode='';
  MS.data.editEmailCodeSent=false;
  MS.data.editEmailVerified=false;
  MS.data.editPhone='';
  MS.data.editPhoneConfirm='';
  MS.data.editPrivacyConsent=false;
  MS.data.editMarketingConsent=false;
  MS.mpTab='editInfo';
  renderM();
}
function sendMemberEmailVerification(){
  const email=(MS.data.editEmail||'').trim();
  const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(!valid){
    toast('새 이메일 주소를 정확히 입력해 주세요.');
    return;
  }
  if(email.toLowerCase()===USER.email.toLowerCase()){
    toast('현재 이메일과 다른 주소를 입력해 주세요.');
    return;
  }
  MS.data.editEmailCodeSent=true;
  MS.data.editEmailVerified=false;
  MS.data.editEmailCode='';
  toast('새 이메일 주소로 인증번호를 발송했습니다.');
  renderMPreserveScroll();
}
function verifyMemberEmailCode(){
  if(!MS.data.editEmailCodeSent){
    toast('먼저 인증번호를 발송해 주세요.');
    return;
  }
  if((MS.data.editEmailCode||'').trim().length<4){
    toast('이메일로 받은 인증번호를 입력해 주세요.');
    return;
  }
  MS.data.editEmailVerified=true;
  toast('새 이메일 인증이 완료되었습니다.');
  renderMPreserveScroll();
}
function getConsentToday(){
  const d=new Date();
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}
function saveMemberInfoChanges(){
  const email=(MS.data.editEmail||'').trim();
  const phone=(MS.data.editPhone||'').replace(/[^0-9]/g,'');
  const confirm=(MS.data.editPhoneConfirm||'').replace(/[^0-9]/g,'');
  if(!MS.data.editPrivacyConsent){toast('개인정보 수집 및 이용에 동의해야 저장할 수 있습니다.');return;}
  if(email&&!MS.data.editEmailVerified){toast('새 이메일 인증을 완료해 주세요.');return;}
  if(phone||confirm){
    if(!/^01[016789]\d{7,8}$/.test(phone)){toast('휴대전화번호를 정확히 입력해 주세요.');return;}
    if(phone!==confirm){toast('재입력한 휴대전화번호가 일치하지 않습니다.');return;}
  }
  if(!email&&!phone&&!MS.data.editMarketingConsent){toast('변경할 정보를 입력하거나 광고 및 마케팅 동의를 선택해 주세요.');return;}
  if(email){USER.email=email;USER.emailVerified=true;}
  if(phone)USER.phone=formatSignupPhone(phone);
  const today=getConsentToday();
  USER.consents.privacy=true;
  USER.consentDates.privacyAgreedAt=today;
  if(MS.data.editMarketingConsent){
    USER.consents.marketing=true;
    USER.consentDates.marketingAgreedAt=today;
    USER.consentDates.marketingWithdrawnAt='';
  }
  toast('회원정보와 동의정보가 저장되었습니다.');
  MS.mpTab='info';
  renderM();
}

function requestMarketingConsentChange(){
  const next=!USER.consents.marketing;
  const title=next?'광고 및 마케팅 목적 활용에 동의하시겠습니까?':'광고 및 마케팅 목적 활용 동의를 철회하시겠습니까?';
  const desc=next
    ?'동의하면 NC문화재단의 소식과 행사 등 광고 및 마케팅 정보를 받을 수 있습니다. 동의 처리 결과는 등록된 휴대전화번호로 문자 메시지가 발송됩니다.'
    :'철회하면 이후 광고 및 마케팅 정보가 발송되지 않습니다. 철회 처리 결과는 등록된 휴대전화번호로 문자 메시지가 발송됩니다.';
  const pop=document.createElement('div');
  pop.className='confirm-pop';
  pop.innerHTML=`<div class="confirm-pop-box">
    <div class="confirm-pop-head">${title}</div>
    <div class="confirm-pop-body">${desc}</div>
    <div class="confirm-pop-actions">
      <button type="button" onclick="this.closest('.confirm-pop').remove()">취소</button>
      <button type="button" class="primary" onclick="applyMarketingConsentChange(${next});this.closest('.confirm-pop').remove()">확인</button>
    </div>
  </div>`;
  document.body.appendChild(pop);
}
function applyMarketingConsentChange(next){
  USER.consents.marketing=!!next;
  const today=getConsentToday();
  if(next){
    USER.consentDates.marketingAgreedAt=today;
    USER.consentDates.marketingWithdrawnAt='';
  }else{
    USER.consentDates.marketingWithdrawnAt=today;
  }
  renderM();
  toast(next
    ?'광고 및 마케팅 목적 활용에 동의했습니다. 처리 결과를 문자 메시지로 안내합니다.'
    :'광고 및 마케팅 목적 활용 동의를 철회했습니다. 처리 결과를 문자 메시지로 안내합니다.');
}

;

function showOutOfScopeNotice(){
  const layer=document.getElementById('outOfScopeLayer');
  if(!layer)return;
  const isEnglish=typeof MS!=='undefined' && MS.data && MS.data.signupLang==='en';
  const title=document.getElementById('outOfScopeTitle');
  const message=document.getElementById('outOfScopeMessage');
  const confirm=document.getElementById('outOfScopeConfirm');
  const close=layer.querySelector('.out-of-scope-close');
  if(title)title.textContent=isEnglish?'Notice':'안내';
  if(message)message.textContent=isEnglish?'This menu is outside the development scope.':'해당 메뉴는 개발 범위가 아닙니다.';
  if(confirm)confirm.textContent=isEnglish?'OK':'확인';
  if(close)close.setAttribute('aria-label',isEnglish?'Close':'닫기');
  layer.classList.add('show');
  document.body.style.overflow='hidden';
  setTimeout(()=>confirm&&confirm.focus(),0);
}
function closeOutOfScopeNotice(){
  const layer=document.getElementById('outOfScopeLayer');
  if(!layer)return;
  layer.classList.remove('show');
  document.body.style.overflow='';
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    const layer=document.getElementById('outOfScopeLayer');
    if(layer&&layer.classList.contains('show'))closeOutOfScopeNotice();
  }
});

;

(function(){
  const OLD_LOCK_KEY='nccfLoginLockState';
  const LOCK_KEY='nccfLoginLockState_v59_37';
  const MAX_FAILURES=20;
  const LOCK_MS=30*60*1000;
  const VALID_IDS=['nccfmember','sanghwa@ncfoundation.or.kr'];
  const VALID_PASSWORDS=['password','••••••••'];

  try{localStorage.removeItem(OLD_LOCK_KEY);}catch(e){}

  function readState(){
    try{
      const raw=localStorage.getItem(LOCK_KEY);
      const state=raw?JSON.parse(raw):{};
      return {failed:Number(state.failed)||0,lockedUntil:Number(state.lockedUntil)||0};
    }catch(e){return {failed:0,lockedUntil:0};}
  }
  function writeState(state){
    try{localStorage.setItem(LOCK_KEY,JSON.stringify(state));}catch(e){}
  }
  function clearState(){
    try{localStorage.removeItem(LOCK_KEY);}catch(e){}
  }
  function getActiveState(){
    const state=readState();
    if(state.lockedUntil&&Date.now()>=state.lockedUntil){
      clearState();
      return {failed:0,lockedUntil:0};
    }
    return state;
  }
  function remainText(ms){
    const total=Math.max(0,Math.ceil(ms/1000));
    const m=Math.floor(total/60);
    const s=total%60;
    return `${m}분 ${String(s).padStart(2,'0')}초`;
  }
  function isValidCredential(id,pw){
    return VALID_IDS.includes(String(id||'').trim())&&VALID_PASSWORDS.includes(String(pw||''));
  }
  function notify(message){
    /* 잠금/실패 결과는 로그인 버튼 클릭 이벤트 직후 alert로만 안내 */
    window.alert(message);
  }
  function registerFailure(){
    let state=getActiveState();
    state.failed+=1;
    if(state.failed>=MAX_FAILURES){
      state={failed:MAX_FAILURES,lockedUntil:Date.now()+LOCK_MS};
      writeState(state);
      notify('로그인 실패가 20회 연속 발생하여 계정이 30분 동안 잠겼습니다. 30분 후 자동으로 잠금이 해제됩니다.');
      return false;
    }
    writeState(state);
    notify(`아이디 또는 비밀번호가 올바르지 않습니다. (${state.failed}/${MAX_FAILURES})`);
    return false;
  }
  function canAttemptLogin(){
    const state=getActiveState();
    if(state.lockedUntil>Date.now()){
      notify(`계정이 잠겨 있습니다. ${remainText(state.lockedUntil-Date.now())} 후 다시 로그인해 주세요.`);
      return false;
    }
    return true;
  }
  function successLogin(){clearState();}

  const originalShowMembershipLogin=window.showMembershipLogin;
  if(typeof originalShowMembershipLogin==='function'){
    window.showMembershipLogin=function(){
      originalShowMembershipLogin.apply(this,arguments);
      const panel=document.querySelector('.membership-login-panel');
      if(panel&&!panel.querySelector('.login-policy-note')){
        const note=document.createElement('p');
        note.className='login-policy-note';
        note.textContent='※ 로그인에 20회 연속 실패하면 계정이 30분 동안 잠기며, 이후 자동으로 해제됩니다.';
        panel.querySelector('.membership-login-submit')?.insertAdjacentElement('afterend',note);
      }
    };
  }

  window.membershipPageLogin=function(){
    const id=(document.getElementById('membershipLoginId')?.value||'').trim();
    const pw=document.getElementById('membershipLoginPw')?.value||'';
    const keepLogin=!!document.getElementById('membershipKeepLogin')?.checked;
    if(!id||!pw){notify('아이디 또는 이메일 주소와 비밀번호를 입력해 주세요.');return;}
    if(!canAttemptLogin())return;
    if(!isValidCredential(id,pw)){registerFailure();return;}
    successLogin();
    loggedIn=true;
    const topLogout=document.getElementById('membershipTopLogout');
    if(topLogout)topLogout.hidden=false;
    try{
      if(keepLogin){localStorage.setItem('nccfMembershipLogin','true');sessionStorage.removeItem('nccfMembershipLogin');}
      else{sessionStorage.setItem('nccfMembershipLogin','true');localStorage.removeItem('nccfMembershipLogin');}
    }catch(e){}
    renderBanner();
    toast(keepLogin?'로그인 상태가 유지됩니다.':USER.name+'님 환영합니다!');
    showMembershipAccount();
  };

  const originalRenderLogin=window.renderLogin;
  if(typeof originalRenderLogin==='function'){
    window.renderLogin=function(m){
      originalRenderLogin(m);
      const footer=m?.querySelector('.mf');
      if(footer&&!m.querySelector('.login-policy-note')){
        const note=document.createElement('p');
        note.className='login-policy-note';
        note.textContent='※ 로그인에 20회 연속 실패하면 계정이 30분 동안 잠기며, 이후 자동으로 해제됩니다.';
        footer.parentElement.insertBefore(note,footer);
      }
    };
  }

  window.doLogin=function(){
    const id=(document.getElementById('loginEmail')?.value||'').trim();
    const pw=document.getElementById('loginPw')?.value||'';
    if(!id||!pw){notify('아이디 또는 이메일 주소와 비밀번호를 입력해 주세요.');return;}
    if(!canAttemptLogin())return;
    if(!isValidCredential(id,pw)){registerFailure();return;}
    successLogin();
    loggedIn=true;
    closeM();
    renderBanner();
    toast(USER.name+'님 환영합니다!');
    if(pendingAction){const next=pendingAction;pendingAction=null;setTimeout(()=>openM(next),320);}
  };

  /* 개발/시연 중 잠금 상태를 수동 초기화할 수 있는 콘솔용 함수 */
  window.resetNccfLoginLock=function(){clearState();return '로그인 실패 횟수와 잠금 상태가 초기화되었습니다.';};
})();

;

(function(){
  const root=document.querySelector('.value-flip-carousel');
  if(!root) return;
  const cards=[...root.querySelectorAll('.vfc-card')];
  const dotsWrap=root.querySelector('.vfc-dots');
  const count=root.querySelector('.vfc-count strong');
  const pauseBtn=root.querySelector('.vfc-pause');
  let current=0, timer=null, paused=false;
  cards.forEach((_,i)=>{
    const b=document.createElement('button');
    b.type='button'; b.className='vfc-dot'; b.setAttribute('aria-label',(i+1)+'번 이미지 보기');
    b.addEventListener('click',()=>{current=i; render(); restart();});
    dotsWrap.appendChild(b);
  });
  const dots=[...dotsWrap.children];
  function relation(i){
    const n=cards.length;
    let d=(i-current+n)%n;
    if(d>n/2) d-=n;
    return d;
  }
  function render(){
    cards.forEach((c,i)=>{
      c.className='vfc-card'+(c.dataset.variant==='new'?' vfc-new':'');
      const d=relation(i);
      if(d===0)c.classList.add('is-active');
      else if(d===-1)c.classList.add('is-prev');
      else if(d===1)c.classList.add('is-next');
      else if(d===-2)c.classList.add('is-far-prev');
      else if(d===2)c.classList.add('is-far-next');
    });
    dots.forEach((d,i)=>d.classList.toggle('is-active',i===current));
    count.textContent=String(current+1);
  }
  function next(){current=(current+1)%cards.length;render();}
  function prev(){current=(current-1+cards.length)%cards.length;render();}
  function start(){if(paused)return;clearInterval(timer);timer=setInterval(next,3000);}
  function restart(){clearInterval(timer);start();}
  root.querySelector('.vfc-next').addEventListener('click',()=>{next();restart();});
  root.querySelector('.vfc-prev').addEventListener('click',()=>{prev();restart();});
  pauseBtn.addEventListener('click',()=>{
    paused=!paused;
    pauseBtn.textContent=paused?'▶':'Ⅱ';
    pauseBtn.setAttribute('aria-label',paused?'자동 롤링 재생':'자동 롤링 일시정지');
    paused?clearInterval(timer):start();
  });
  root.addEventListener('mouseenter',()=>clearInterval(timer));
  root.addEventListener('mouseleave',()=>start());
  root.addEventListener('focusin',()=>clearInterval(timer));
  root.addEventListener('focusout',()=>start());
  render();start();
})();

;

(function(){
  function getLang(){
    try{return localStorage.getItem('nccfMembershipLang')==='en'?'en':'ko';}catch(e){return 'ko';}
  }
  function setLang(lang){
    lang=lang==='en'?'en':'ko';
    try{localStorage.setItem('nccfMembershipLang',lang);}catch(e){}
    if(typeof MS!=='undefined'&&MS){if(!MS.data)MS.data={};MS.data.signupLang=lang;MS.data.national=lang==='en'?'foreign':'local';}
    return lang;
  }
  window.getMembershipLang=getLang;
  window.setMembershipLang=setLang;
  window.toggleMembershipLanguage=function(){setLang(getLang()==='en'?'ko':'en');showMembershipLogin();};

  const oldInterest=window.renderMypageInterestProjects;
  if(typeof oldInterest==='function'){
    window.renderMypageInterestProjects=function(){
      let html=oldInterest.apply(this,arguments);
      if(getLang()==='en') html=html
        .replaceAll('프로젝토리','Projectory').replaceAll('청소년 창의교육','Youth Creative Education')
        .replaceAll('AAC','AAC').replaceAll('보완대체 의사소통','Augmentative and Alternative Communication')
        .replaceAll('AI 윤리','AI Ethics').replaceAll('기술 윤리','Technology Ethics')
        .replaceAll('문화예술','Arts & Culture').replaceAll('예술인 지원','Artist Support');
      return html;
    };
  }

  window.setMembershipPageTitle=function(isMypage){
    const en=getLang()==='en', title=document.querySelector('.membership-page-title');
    if(title) title.textContent=isMypage?(en?'NC Cultural Foundation Gachijieum Membership':'NC문화재단 가치지음 멤버십'):(en?'NC Cultural Foundation Gachijieum Membership Sign-up':'NC문화재단 가치지음 멤버십');
  };

  window.showMembershipLogin=function(){
    const en=getLang()==='en';
    setMembershipPageTitle(false);
    const logout=document.getElementById('membershipTopLogout');if(logout)logout.hidden=!loggedIn;
    MS={mode:null,step:1,data:{signupLang:en?'en':'ko',national:en?'foreign':'local'},mpTab:'info'};
    const root=document.getElementById('membershipPageView');if(!root)return;
    root.className='';
    root.innerHTML=`
      <div class="membership-login-intro" aria-label="${en?'Gachijieum membership information':'가치지음 멤버십 안내'}">
        <strong>${en?'Creating value together, connecting experiences.':'함께 만드는 가치, 이어지는 경험.'}</strong>
        <span>${en?'Discover the NC Cultural Foundation’s programs and activities through Gachijieum Membership.':'가치지음 멤버십에서 NC문화재단의 다양한 활동을 만나보세요.'}</span>
      </div>
      <section class="membership-login-panel" aria-label="${en?'Membership sign in':'멤버십 로그인'}">
        <div class="membership-login-lang">
          <span class="lang-label ${en?'':'active'}">한국어</span>
          <button class="lang-toggle ${en?'en':''}" type="button" onclick="toggleMembershipLanguage()" aria-label="${en?'Switch to Korean':'영어로 전환'}"><span class="toggle-knob"></span></button>
          <span class="lang-label ${en?'active':''}">English</span>
        </div>
        <h1 class="membership-login-title">${en?'Sign In':'로그인'}</h1>
        <div class="fg"><label class="fl" for="membershipLoginId">${en?'ID or Email':'아이디 또는 이메일'}</label><input class="fi" id="membershipLoginId" autocomplete="username" placeholder="${en?'Enter your ID or email address':'아이디 또는 이메일 주소를 입력해 주세요'}" value="nccfmember"></div>
        <div class="fg"><label class="fl" for="membershipLoginPw">${en?'Password':'비밀번호'}</label><input class="fi" id="membershipLoginPw" type="password" autocomplete="current-password" placeholder="${en?'Enter your password':'비밀번호를 입력해 주세요'}" value="password"></div>
        <div class="membership-login-options"><label class="membership-keep-login"><input type="checkbox" id="membershipKeepLogin"><span class="membership-keep-box" aria-hidden="true"></span><span>${en?'Keep me signed in':'로그인 상태 유지'}</span></label>
          <p class="membership-privacy-alert">${en?'※ For your privacy, do not keep yourself signed in on a shared computer, and always sign out after use.':'※ 개인정보 보호를 위해 공용 PC에서는 ‘로그인 상태 유지’를 선택하지 마시고, 사용 후 반드시 로그아웃하시기 바랍니다.'}</p></div>
        <button class="membership-login-submit" type="button" onclick="membershipPageLogin()">${en?'Sign In':'로그인'}</button>
        <p class="login-policy-note">${en?'※ After 20 consecutive failed attempts, the account will be locked for 30 minutes and then unlocked automatically.':'※ 로그인에 20회 연속 실패하면 계정이 30분 동안 잠기며, 이후 자동으로 해제됩니다.'}</p>
        <div class="membership-login-links"><button type="button" onclick="showMembershipSignup()">${en?'Sign Up':'회원가입'}</button><button type="button" onclick="showFindId()">${en?'Find ID':'아이디 찾기'}</button><button type="button" onclick="showFindPassword()">${en?'Reset Password':'비밀번호 찾기'}</button></div>
      </section>`;
  };

  const oldSignup=window.showMembershipSignup;
  window.showMembershipSignup=function(){
    const lang=getLang();
    setMembershipPageTitle(false);
    MS={mode:'signupPage',step:1,data:{signupLang:lang,national:lang==='en'?'foreign':'local'},mpTab:'info'};
    renderM();window.scrollTo({top:0,behavior:'smooth'});
  };

  window.showMembershipMypage=function(){
    const lang=getLang(), logout=document.getElementById('membershipTopLogout');if(logout)logout.hidden=!loggedIn;
    setMembershipPageTitle(true);
    MS={mode:'mypagePage',step:1,data:{signupLang:lang,national:lang==='en'?'foreign':'local'},mpTab:'info'};
    renderM();window.scrollTo({top:0,behavior:'smooth'});
  };

  window.renderMypage=function(m){
    if(!m||!MS)return;if(!MS.data)MS.data={};MS.data.signupLang=getLang();
    const en=getLang()==='en',tab=['info','editInfo','consent','consentEdit'].includes(MS.mpTab)?MS.mpTab:'info';
    const t=(ko,enText)=>en?enText:ko;let body='';
    const tabs=`<div class="mp-tabs"><div class="mp-tab ${(tab==='info'||tab==='editInfo')?'on':''}" onclick="MS.mpTab='info';renderM()">${t('회원정보','Profile')}</div><div class="mp-tab ${(tab==='consent'||tab==='consentEdit')?'on':''}" onclick="MS.mpTab='consent';renderM()">${t('동의관리','Consent')}</div></div>`;
    if(tab==='info')body=`${tabs}<div class="step-c">
      <div class="mp-card"><div class="mp-card-t">${t('기본정보','Basic Information')}</div>
      <div class="mp-row"><span class="k">ID</span><span class="v">${USER.id}</span></div><div class="mp-row"><span class="k">${t('이름','Name')}</span><span class="v">${USER.name}</span></div><div class="mp-row"><span class="k">${t('이메일','Email')}</span><span class="v">${USER.email}</span></div><div class="mp-row"><span class="k">${t('연락처','Mobile Number')}</span><span class="v">${USER.phone}</span></div><div class="mp-row"><span class="k">${t('생년월일','Date of Birth')}</span><span class="v">${USER.birth}</span></div><div class="mp-row"><span class="k">${t('가입일자','Member Since')}</span><span class="v">${USER.joinDate}</span></div></div>
      <div class="mp-card mp-interest-project-card"><div class="mp-card-t">${t('관심 재단 사업','Programs of Interest')}</div><div class="mp-interest-project-list">${renderMypageInterestProjects()}</div></div>
      <div class="mp-card"><div class="mp-card-t">${t('인증정보','Verification')}</div><div class="mp-row"><span class="k">${t('이메일 인증','Email Verification')}</span><span class="v"><span class="mp-badge ${USER.emailVerified?'y':''}">${USER.emailVerified?t('인증 완료','Verified'):t('미인증','Not Verified')}</span></span></div><div class="mp-row"><span class="k">${t('NICE 본인인증','NICE Identity Verification')}</span><span class="v"><span class="mp-badge ${USER.niceVerified?'y':''}">${USER.niceVerified?t('인증 완료','Verified'):t('도입예정','Coming Soon')}</span></span></div></div>
      <div style="display:flex;gap:7px;margin-top:8px;flex-wrap:wrap"><button class="btn btn-s mp-small-action" type="button" onclick="openMemberInfoEdit()">${t('회원정보 변경','Edit Profile')}</button><button class="btn btn-s mp-small-action" type="button" onclick="showChangePassword(false)">${t('비밀번호 변경','Change Password')}</button><button class="btn btn-s mp-small-action danger" type="button" onclick="showDeleteAccount()">${t('회원탈퇴','Delete Account')}</button></div></div>`;
    else if(tab==='editInfo')body=`${tabs}<div class="step-c"><div class="st">${t('회원정보 변경','Edit Profile')}</div><div class="sdesc">${t('변경할 정보만 입력하고 개인정보 수집 및 이용에 동의한 뒤 한 번에 저장해 주세요.','Enter only the information you want to change, agree to the collection and use of personal information, and save all changes at once.')}</div>
      <div class="mp-card"><div class="mp-card-t">${t('이메일 변경','Change Email')}</div><div class="fg"><label class="fl">${t('현재 이메일','Current Email')}</label><input class="fi" value="${USER.email}" disabled></div><div class="fg"><label class="fl">${t('새 이메일','New Email')}</label><div class="inline-field-action signup-id-row"><input class="fi" type="email" placeholder="${t('변경하지 않으려면 비워 두세요','Leave blank to keep the current email')}" value="${MS.data.editEmail||''}" oninput="MS.data.editEmail=this.value;MS.data.editEmailCodeSent=false;MS.data.editEmailVerified=false;MS.data.editEmailCode=''"><button class="btn inline-action-btn" type="button" onclick="sendMemberEmailVerification()">${t('인증번호 발송','Send Code')}</button></div></div>${MS.data.editEmailCodeSent?`<div class="fg"><label class="fl">${t('인증번호','Verification Code')}</label><div class="inline-field-action"><input class="fi" inputmode="numeric" maxlength="6" placeholder="${t('인증번호 6자리','6-digit code')}" value="${MS.data.editEmailCode||''}" oninput="MS.data.editEmailCode=this.value.replace(/[^0-9]/g,'').slice(0,6)"><button class="btn inline-action-btn" type="button" onclick="verifyMemberEmailCode()">${t('인증 확인','Verify')}</button></div><div class="consent-note">${t('데모에서는 4~6자리 숫자를 입력하면 인증됩니다.','For this demo, any 4–6 digit number is accepted.')}</div></div>`:''}${MS.data.editEmailVerified?`<div style="margin-top:10px"><span class="vf">✓ ${t('새 이메일 인증 완료','New email verified')}</span></div>`:''}</div>
      <div class="mp-card"><div class="mp-card-t">${t('휴대전화번호 변경','Change Mobile Number')}</div><div class="sdesc mp-phone-change-desc">${t('회원가입과 동일하게 변경할 휴대전화번호를 두 번 입력해 주세요.','Enter the new mobile number twice, as in the sign-up process.')}</div><div class="fg signup-phone-field"><label class="fl">${t('휴대전화번호','Mobile Number')}</label><input class="fi" inputmode="numeric" maxlength="11" autocomplete="tel" placeholder="${t('변경하지 않으려면 비워 두세요','Leave blank to keep the current number')}" value="${MS.data.editPhone||''}" oninput="MS.data.editPhone=this.value.replace(/[^0-9]/g,'').slice(0,11);this.value=MS.data.editPhone;updateMemberPhoneMatchUI()"></div><div class="fg signup-phone-field"><label class="fl">${t('휴대전화번호 재입력','Re-enter Mobile Number')}</label><input class="fi" inputmode="numeric" maxlength="11" placeholder="${t('휴대전화번호를 다시 입력해 주세요','Re-enter your mobile phone number')}" value="${MS.data.editPhoneConfirm||''}" oninput="MS.data.editPhoneConfirm=this.value.replace(/[^0-9]/g,'').slice(0,11);this.value=MS.data.editPhoneConfirm;updateMemberPhoneMatchUI()"><div id="memberPhoneMatchMessage" class="signup-field-message ${MS.data.editPhoneConfirm?(MS.data.editPhone===MS.data.editPhoneConfirm?'ok':'bad'):''}">${MS.data.editPhoneConfirm?(MS.data.editPhone===MS.data.editPhoneConfirm?t('휴대전화번호가 일치합니다.','The phone numbers match.'):t('휴대전화번호가 일치하지 않습니다.','The phone numbers do not match.')):''}</div></div></div>
      <div class="mp-card member-edit-consent-card"><div class="mp-card-t">${t('정보 변경 동의','Consent for Profile Changes')}</div><div class="member-edit-consent-row"><label class="member-edit-consent-check"><input type="checkbox" ${MS.data.editPrivacyConsent?'checked':''} onchange="MS.data.editPrivacyConsent=this.checked"><span><strong>${t('(필수)','(Required)')}</strong> ${t('개인정보 수집 및 이용에 동의합니다.','I agree to the collection and use of personal information.')}</span></label><button type="button" class="agree-view-btn" onclick="showAgreement('privacy', ${en})">${t('보기','View')}</button></div><div class="member-edit-consent-row"><label class="member-edit-consent-check"><input type="checkbox" ${MS.data.editMarketingConsent?'checked':''} onchange="MS.data.editMarketingConsent=this.checked"><span><strong>${t('(선택)','(Optional)')}</strong> ${t('광고 및 마케팅 목적 활용에 동의합니다.','I agree to the use of my information for advertising and marketing purposes.')}</span></label><button type="button" class="agree-view-btn" onclick="showAgreement('marketing', ${en})">${t('보기','View')}</button></div></div><div class="member-edit-actions"><button class="btn btn-s" type="button" onclick="MS.mpTab='info';renderM()">${t('취소','Cancel')}</button><button class="btn btn-p" type="button" onclick="saveMemberInfoChanges()">${t('변경사항 저장','Save Changes')}</button></div></div>`;
    else {const md=USER.consents.marketing?t('동의일시','Agreed'):t('철회일시','Withdrawn'),mv=USER.consents.marketing?USER.consentDates.marketingAgreedAt:(USER.consentDates.marketingWithdrawnAt||'-');body=`${tabs}<div class="step-c"><div class="sdesc">${t('회원가입 및 회원정보 변경 화면에서 처리한 동의 여부와 처리일시를 확인할 수 있습니다.','Review your consent status and processing dates from sign-up and profile changes.')}</div><div class="mp-card consent-history-card"><div class="mp-consent consent-history-row"><div><div class="consent-history-title">${t('(필수) 멤버십 이용약관','(Required) Membership Terms of Use')}</div><div class="consent-history-date">${t('동의일시','Agreed')} ${USER.consentDates.termsAgreedAt}</div></div><span class="mp-badge y">${t('동의','Agreed')}</span></div><div class="mp-consent consent-history-row"><div><div class="consent-history-title">${t('(필수) 개인정보 수집 및 이용','(Required) Collection and Use of Personal Information')}</div><div class="consent-history-date">${t('동의일시','Agreed')} ${USER.consentDates.privacyAgreedAt}</div></div><span class="mp-badge ${USER.consents.privacy?'y':'n'}">${USER.consents.privacy?t('동의','Agreed'):t('미동의','Not Agreed')}</span></div><div class="mp-consent consent-history-row"><div><div class="consent-history-title">${t('(선택) 광고 및 마케팅 목적 활용','(Optional) Advertising and Marketing Use')}</div><div class="consent-history-date">${md} ${mv}</div></div><div class="consent-history-actions"><span class="mp-badge ${USER.consents.marketing?'y':'n'}">${USER.consents.marketing?t('동의','Agreed'):t('철회','Withdrawn')}</span><button type="button" class="consent-withdraw-btn" onclick="requestMarketingConsentChange()">${USER.consents.marketing?t('동의 철회','Withdraw Consent'):t('동의하기','Agree')}</button></div></div></div><div class="sinfo" style="margin-top:8px;color:#E53935;border-left-color:#E53935;background:rgba(229,57,53,.05)">${t('※ 동의 철회 시 이벤트 및 혜택 안내가 제한됩니다.','※ Withdrawing consent will limit event and benefit notifications.')}</div></div>`;}
    m.innerHTML=`${mHead(t('마이페이지','My Page'),false)}<div class="mb">${body}</div>`;
  };

  // Repaint current entry using the stored language after all legacy scripts finish loading.
  if(document.body.classList.contains('membership-on')) setTimeout(function(){loggedIn?showMembershipMypage():showMembershipLogin();},0);
})();

;

(function(){
  const isEnglish=()=>typeof getMembershipLang==='function'&&getMembershipLang()==='en';
  const tr=(ko,en)=>isEnglish()?en:ko;

  const previousShowMembershipLogin=window.showMembershipLogin;
  window.showMembershipLogin=function(){
    previousShowMembershipLogin.apply(this,arguments);
    const row=document.querySelector('.membership-login-lang');
    if(row&&!row.querySelector('.membership-lang-globe')){
      row.insertAdjacentHTML('afterbegin',`
        <span class="membership-lang-globe" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"></path>
          </svg>
        </span>`);
    }
  };

  window.sendMemberEmailVerification=function(){
    if(!MS||!MS.data)return;
    const email=(MS.data.editEmail||'').trim();
    const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if(!valid){toast(tr('새 이메일 주소를 정확히 입력해 주세요.','Please enter a valid new email address.'));return;}
    if(email.toLowerCase()===String(USER.email||'').toLowerCase()){
      toast(tr('현재 이메일과 다른 주소를 입력해 주세요.','Please enter an email address different from your current one.'));return;
    }
    MS.data.editEmailCodeSent=true;
    MS.data.editEmailVerified=false;
    MS.data.editEmailCode='';
    toast(tr('새 이메일 주소로 인증번호를 발송했습니다.','A verification code has been sent to your new email address.'));
    renderMPreserveScroll();
  };

  window.verifyMemberEmailCode=function(){
    if(!MS||!MS.data)return;
    if(!MS.data.editEmailCodeSent){toast(tr('먼저 인증번호를 발송해 주세요.','Please send a verification code first.'));return;}
    if((MS.data.editEmailCode||'').trim().length<4){toast(tr('이메일로 받은 인증번호를 입력해 주세요.','Please enter the verification code sent to your email.'));return;}
    MS.data.editEmailVerified=true;
    toast(tr('새 이메일 인증이 완료되었습니다.','Your new email address has been verified.'));
    renderMPreserveScroll();
  };

  window.saveMemberInfoChanges=function(){
    if(!MS||!MS.data)return;
    const email=(MS.data.editEmail||'').trim();
    const phone=(MS.data.editPhone||'').replace(/[^0-9]/g,'');
    const confirmPhone=(MS.data.editPhoneConfirm||'').replace(/[^0-9]/g,'');
    if(!MS.data.editPrivacyConsent){toast(tr('개인정보 수집 및 이용에 동의해야 저장할 수 있습니다.','You must agree to the collection and use of personal information before saving.'));return;}
    if(email&&!MS.data.editEmailVerified){toast(tr('새 이메일 인증을 완료해 주세요.','Please complete verification of your new email address.'));return;}
    if(phone||confirmPhone){
      if(!/^01[016789]\d{7,8}$/.test(phone)){toast(tr('휴대전화번호를 정확히 입력해 주세요.','Please enter a valid mobile phone number.'));return;}
      if(phone!==confirmPhone){toast(tr('재입력한 휴대전화번호가 일치하지 않습니다.','The re-entered mobile phone number does not match.'));return;}
    }
    if(!email&&!phone&&!MS.data.editMarketingConsent){toast(tr('변경할 정보를 입력하거나 광고 및 마케팅 동의를 선택해 주세요.','Enter information to change or select advertising and marketing consent.'));return;}
    if(email){USER.email=email;USER.emailVerified=true;}
    if(phone)USER.phone=formatSignupPhone(phone);
    const today=getConsentToday();
    USER.consents.privacy=true;
    USER.consentDates.privacyAgreedAt=today;
    if(MS.data.editMarketingConsent){
      USER.consents.marketing=true;
      USER.consentDates.marketingAgreedAt=today;
      USER.consentDates.marketingWithdrawnAt='';
    }
    toast(tr('회원정보와 동의정보가 저장되었습니다.','Your profile and consent information have been saved.'));
    MS.mpTab='info';
    renderM();
  };

  window.requestMarketingConsentChange=function(){
    const next=!USER.consents.marketing;
    const title=next
      ?tr('광고 및 마케팅 목적 활용에 동의하시겠습니까?','Agree to the use of your information for advertising and marketing?')
      :tr('광고 및 마케팅 목적 활용 동의를 철회하시겠습니까?','Withdraw your advertising and marketing consent?');
    const desc=next
      ?tr(
        '동의하면 NC문화재단의 소식과 행사 등 광고 및 마케팅 정보를 받을 수 있습니다. 동의 처리 결과는 등록된 휴대전화번호로 문자 메시지가 발송됩니다.',
        'By agreeing, you may receive advertising and marketing information, including NC Cultural Foundation news and event updates. A text message confirming the result will be sent to your registered mobile number.'
       )
      :tr(
        '철회하면 이후 광고 및 마케팅 정보가 발송되지 않습니다. 철회 처리 결과는 등록된 휴대전화번호로 문자 메시지가 발송됩니다.',
        'After withdrawal, you will no longer receive advertising or marketing information. A text message confirming the result will be sent to your registered mobile number.'
       );
    const pop=document.createElement('div');
    pop.className='confirm-pop';
    pop.setAttribute('role','dialog');
    pop.setAttribute('aria-modal','true');
    pop.setAttribute('aria-label',title);
    pop.innerHTML=`<div class="confirm-pop-box">
      <div class="confirm-pop-head">${title}</div>
      <div class="confirm-pop-body">${desc}</div>
      <div class="confirm-pop-actions">
        <button type="button" onclick="this.closest('.confirm-pop').remove()">${tr('취소','Cancel')}</button>
        <button type="button" class="primary" onclick="applyMarketingConsentChange(${next});this.closest('.confirm-pop').remove()">${tr('확인','Confirm')}</button>
      </div>
    </div>`;
    document.body.appendChild(pop);
  };

  window.applyMarketingConsentChange=function(next){
    USER.consents.marketing=!!next;
    const today=getConsentToday();
    if(next){
      USER.consentDates.marketingAgreedAt=today;
      USER.consentDates.marketingWithdrawnAt='';
    }else{
      USER.consentDates.marketingWithdrawnAt=today;
    }
    renderM();
    toast(next
      ?tr('광고 및 마케팅 목적 활용에 동의했습니다. 처리 결과를 문자 메시지로 안내합니다.','You have agreed to the use of your information for advertising and marketing. A text message will confirm the result.')
      :tr('광고 및 마케팅 목적 활용 동의를 철회했습니다. 처리 결과를 문자 메시지로 안내합니다.','Your advertising and marketing consent has been withdrawn. A text message will confirm the result.')
    );
  };

  if(document.body.classList.contains('membership-on')&&!loggedIn){
    setTimeout(()=>showMembershipLogin(),0);
  }
})();

;

(function(){
  function isEn(){return typeof getMembershipLang==='function'&&getMembershipLang()==='en'}
  function updateMembershipHeaderLanguage(){
    var en=isEn();
    var back=document.querySelector('.membership-site .ms-header .ms-back:not(.ms-logout)');
    var logout=document.getElementById('membershipTopLogout');
    if(back){back.textContent=en?'Back to Website':'홈페이지로 돌아가기';back.setAttribute('aria-label',back.textContent)}
    if(logout){logout.textContent=en?'Sign Out':'로그아웃';logout.setAttribute('aria-label',logout.textContent)}
    document.documentElement.lang=en?'en':'ko';
  }
  window.updateMembershipHeaderLanguage=updateMembershipHeaderLanguage;
  ['showMembershipLogin','showMembershipSignup','showMembershipMypage'].forEach(function(name){
    var original=window[name];
    if(typeof original!=='function')return;
    window[name]=function(){var result=original.apply(this,arguments);updateMembershipHeaderLanguage();return result};
  });
  var originalToggle=window.toggleMembershipLanguage;
  if(typeof originalToggle==='function')window.toggleMembershipLanguage=function(){var result=originalToggle.apply(this,arguments);updateMembershipHeaderLanguage();return result};
  updateMembershipHeaderLanguage();
})();

;

(function(){
  function isEnglish(){
    return typeof getMembershipLang==='function' && getMembershipLang()==='en';
  }
  function syncLanguageButton(){
    var button=document.querySelector('.membership-login-lang .lang-toggle');
    if(!button)return;
    var en=isEnglish();
    button.textContent=en?'한국어':'English';
    button.setAttribute('aria-label',en?'한국어로 전환':'Switch to English');
    button.setAttribute('title',en?'한국어로 전환':'Switch to English');
  }
  var previousShow=window.showMembershipLogin;
  if(typeof previousShow==='function'){
    window.showMembershipLogin=function(){
      var result=previousShow.apply(this,arguments);
      syncLanguageButton();
      return result;
    };
  }
  var previousToggle=window.toggleMembershipLanguage;
  if(typeof previousToggle==='function'){
    window.toggleMembershipLanguage=function(){
      var result=previousToggle.apply(this,arguments);
      setTimeout(syncLanguageButton,0);
      return result;
    };
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',syncLanguageButton,{once:true});
  }else{
    syncLanguageButton();
  }
})();

;

(function(){
  const demo={id:'nccfmember',email:'sanghwa@ncfoundation.or.kr',name:'김상화',phone:'01012345678',code:'123456'};
  const verifyState={findId:{expiresAt:0,timer:null},findPw:{expiresAt:0,timer:null}};
  function root(){return document.getElementById('membershipPageView')}
  function shell(title,desc,body){return `<section class="account-flow-shell"><div class="account-flow-head"><h1>${title}</h1><p>${desc}</p></div><div class="account-flow-body">${body}</div></section>`}
  function field(id,label,type='text',placeholder=''){return `<div class="fg"><label class="fl" for="${id}">${label}</label><input class="fi" id="${id}" type="${type}" placeholder="${placeholder}"></div>`}
  function setPage(html){const r=root();if(!r)return;r.className='';r.innerHTML=html;window.scrollTo({top:0,behavior:'smooth'})}
  function formatRemaining(ms){const total=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`}
  function stopVerifyTimer(prefix){const state=verifyState[prefix];if(state&&state.timer){clearInterval(state.timer);state.timer=null}}
  function startVerifyTimer(prefix){
    const state=verifyState[prefix];if(!state)return;
    stopVerifyTimer(prefix);
    state.expiresAt=Date.now()+(30*60*1000);
    const update=()=>{
      const el=document.getElementById(prefix+'Timer');
      if(!el){stopVerifyTimer(prefix);return}
      const remain=state.expiresAt-Date.now();
      if(remain<=0){el.textContent='인증번호 유효시간이 만료되었습니다.';el.classList.add('expired');stopVerifyTimer(prefix);return}
      el.textContent='유효시간 '+formatRemaining(remain);el.classList.remove('expired');
    };
    update();state.timer=setInterval(update,1000);
  }
  function isVerifyValid(prefix){const state=verifyState[prefix];return !!(state&&state.expiresAt&&Date.now()<state.expiresAt)}
  function resendCode(prefix){startVerifyTimer(prefix);toast('인증번호가 재발송되었습니다. 유효시간은 30분입니다. (데모: 123456)')}
  window.resendAccountCode=resendCode;
  function codeRow(prefix){return `<div class="fg"><label class="fl" for="${prefix}Code">인증번호</label><div class="account-verify-row"><input class="fi" id="${prefix}Code" inputmode="numeric" maxlength="6" placeholder="인증번호 6자리"><button class="btn btn-s" type="button" onclick="resendAccountCode('${prefix}')">재발송</button></div><div class="account-verify-meta"><span class="account-verify-demo">데모 인증번호는 123456입니다.</span><span class="account-verify-timer" id="${prefix}Timer"></span></div></div>`}
  function maskId(id){
    const value=String(id||'');
    if(value.length<=2)return value.charAt(0)+'*';
    if(value.length<=5)return value.slice(0,2)+'*'.repeat(value.length-2);
    return value.slice(0,3)+'*'.repeat(Math.max(3,value.length-5))+value.slice(-2);
  }
  window.showFindId=function(){stopVerifyTimer('findId');setMembershipPageTitle(false);setPage(shell('아이디 찾기','회원가입 시 등록한 이메일 인증을 통해 아이디를 확인할 수 있습니다.',`
    ${field('findIdName','이름','text','이름을 입력해 주세요')}
    ${field('findIdEmail','이메일','email','회원가입 시 등록한 이메일 주소')}
    <div class="account-flow-actions"><button class="btn btn-s" onclick="showMembershipLogin()">취소</button><button class="btn btn-p" onclick="sendFindIdCode()">이메일 인증번호 받기</button></div>`))};
  window.sendFindIdCode=function(){
    const n=(document.getElementById('findIdName')?.value||'').trim(),e=(document.getElementById('findIdEmail')?.value||'').trim();
    if(!n||!/^\S+@\S+\.\S+$/.test(e)){toast('이름과 이메일 주소를 정확히 입력해 주세요.');return}
    setPage(shell('아이디 찾기','입력한 이메일로 발송된 인증번호를 입력해 주세요.',`${codeRow('findId')}<div class="account-security-notice">※ 개인정보 보호를 위해 이름과 이메일의 일치 여부는 별도로 안내하지 않습니다. 회원가입 시 등록한 이름과 이메일을 정확히 입력한 경우에만 인증번호를 받을 수 있습니다.</div><div class="account-flow-actions"><button class="btn btn-s" onclick="showFindId()">이전</button><button class="btn btn-p" onclick="completeFindId()">인증 확인</button></div>`));
    startVerifyTimer('findId');toast('이메일 인증번호를 발송했습니다. 유효시간은 30분입니다. (데모: 123456)')
  };
  window.completeFindId=function(){const c=(document.getElementById('findIdCode')?.value||'').trim();if(!isVerifyValid('findId')){toast('인증번호 유효시간이 만료되었습니다. 다시 발송해 주세요.');return}if(c!==demo.code){toast('인증번호가 일치하지 않습니다.');return}stopVerifyTimer('findId');setPage(shell('아이디 찾기 완료','회원님의 아이디를 확인했습니다.',`<div class="account-result"><strong>${maskId(demo.id)}</strong><p>가입일 2026.05.26<br>개인정보 보호를 위해 아이디 일부를 가려서 안내합니다.</p></div><div class="account-flow-actions"><button class="btn btn-s" onclick="showFindPassword()">비밀번호 찾기</button><button class="btn btn-p" onclick="showMembershipLogin()">로그인</button></div>`))};

  window.showFindPassword=function(){stopVerifyTimer('findPw');setMembershipPageTitle(false);setPage(shell('비밀번호 찾기','회원가입 시 등록한 이메일 인증 후 비밀번호 변경 화면으로 이동합니다.',`
    ${field('findPwId','아이디','text','아이디를 입력해 주세요')}
    ${field('findPwEmail','이메일','email','회원가입 시 등록한 이메일 주소')}
    <div class="account-flow-actions"><button class="btn btn-s" onclick="showMembershipLogin()">취소</button><button class="btn btn-p" onclick="sendFindPwCode()">이메일 인증번호 받기</button></div>`))};
  window.sendFindPwCode=function(){const id=(document.getElementById('findPwId')?.value||'').trim(),e=(document.getElementById('findPwEmail')?.value||'').trim();if(!id||!/^\S+@\S+\.\S+$/.test(e)){toast('아이디와 이메일 주소를 정확히 입력해 주세요.');return}setPage(shell('비밀번호 찾기','입력한 이메일로 발송된 인증번호를 입력해 주세요.',`${codeRow('findPw')}<div class="account-flow-actions"><button class="btn btn-s" onclick="showFindPassword()">이전</button><button class="btn btn-p" onclick="verifyFindPw()">인증 확인</button></div>`));startVerifyTimer('findPw');toast('이메일 인증번호를 발송했습니다. 유효시간은 30분입니다. (데모: 123456)')};
  window.verifyFindPw=function(){const c=(document.getElementById('findPwCode')?.value||'').trim();if(!isVerifyValid('findPw')){toast('인증번호 유효시간이 만료되었습니다. 다시 발송해 주세요.');return}if(c!==demo.code){toast('인증번호가 일치하지 않습니다.');return}stopVerifyTimer('findPw');toast('이메일 인증이 완료되었습니다.');showChangePassword(true)};
  function passwordFields(){return `${field('newAccountPw','새 비밀번호','password','영문 대·소문자, 숫자, 특수문자 중 3종류 이상 · 8자리 이상')}${field('newAccountPw2','새 비밀번호 확인','password','새 비밀번호를 다시 입력해 주세요')}<div class="password-policy-box"><div class="password-policy-title">비밀번호 설정 규칙</div><div>• 영문 대문자·소문자·숫자·특수문자 중 3종류 이상 조합</div><div>• 8자리 이상 입력</div><div>• 아이디, 생일, 전화번호 등 추측하기 쉬운 조합 사용 불가</div></div>`}
  function validPw(p){let types=0;if(/[a-z]/.test(p))types++;if(/[A-Z]/.test(p))types++;if(/\d/.test(p))types++;if(/[^A-Za-z0-9]/.test(p))types++;return p.length>=8&&types>=3}
  window.showResetPassword=function(){setPage(shell('새 비밀번호 설정','본인 인증이 완료되었습니다. 새로운 비밀번호를 설정해 주세요.',`${passwordFields()}<div class="account-flow-actions"><button class="btn btn-s" onclick="showMembershipLogin()">취소</button><button class="btn btn-p" onclick="completeResetPassword()">비밀번호 재설정</button></div>`))};
  window.completeResetPassword=function(){const a=document.getElementById('newAccountPw')?.value||'',b=document.getElementById('newAccountPw2')?.value||'';if(!validPw(a)){toast('비밀번호 설정 규칙을 확인해 주세요.');return}if(a!==b){toast('비밀번호 확인이 일치하지 않습니다.');return}setPage(shell('비밀번호 재설정 완료','새 비밀번호가 정상적으로 등록되었습니다.',`<div class="account-result"><div class="account-complete-icon">✓</div><strong>비밀번호 변경 완료</strong><p>새 비밀번호로 다시 로그인해 주세요.</p></div><div class="account-flow-actions"><button class="btn btn-p" onclick="showMembershipLogin()">로그인으로 이동</button></div>`))};

  window.showChangePassword=function(resetMode=false){setMembershipPageTitle(!resetMode);setPage(shell('비밀번호 변경',resetMode?'이메일 인증이 완료되었습니다. 새로운 비밀번호로 변경해 주세요.':'안전한 계정 이용을 위해 현재 비밀번호를 확인한 후 변경합니다.',`${resetMode?'':'<button class="account-flow-back" onclick="showMembershipAccount()">← 마이페이지로 돌아가기</button>'+field('currentAccountPw','현재 비밀번호','password','현재 비밀번호를 입력해 주세요')}${passwordFields()}<div class="password-management-note"><strong>비밀번호 관리 안내</strong><span>직전 비밀번호와 최근 사용한 비밀번호는 재사용할 수 없습니다.</span></div><div class="account-flow-actions"><button class="btn btn-s" onclick="${resetMode?'showMembershipLogin()':'showMembershipAccount()'}">취소</button><button class="btn btn-p" onclick="completeChangePassword(${resetMode})">비밀번호 변경</button></div>`))};
  window.completeChangePassword=function(resetMode=false){const cur=document.getElementById('currentAccountPw')?.value||'',a=document.getElementById('newAccountPw')?.value||'',b=document.getElementById('newAccountPw2')?.value||'';if(!resetMode&&!cur){toast('현재 비밀번호를 입력해 주세요.');document.getElementById('currentAccountPw')?.focus();return}if(!resetMode&&!['password','••••••••'].includes(cur)){toast('현재 비밀번호가 일치하지 않습니다.');document.getElementById('currentAccountPw')?.focus();return}if(!validPw(a)){toast('새 비밀번호 설정 규칙을 확인해 주세요.');return}if(a!==b){toast('새 비밀번호 확인이 일치하지 않습니다.');return}if(!resetMode&&cur===a){toast('현재 비밀번호와 다른 비밀번호를 입력해 주세요.');return}if(resetMode){setPage(shell('비밀번호 변경 완료','비밀번호가 정상적으로 변경되었습니다.',`<div class="account-result"><div class="account-complete-icon">✓</div><strong>비밀번호 변경 완료</strong><p>새 비밀번호로 로그인해 주세요.</p></div><div class="account-flow-actions"><button class="btn btn-p" onclick="showMembershipLogin()">로그인으로 이동</button></div>`));return}toast('비밀번호가 변경되었습니다.');showMembershipAccount()};

  window.showWithdrawMember=function(){setMembershipPageTitle(true);setPage(shell('회원탈퇴','탈퇴 전 아래 내용을 반드시 확인해 주세요.',`<button class="account-flow-back" onclick="showMembershipAccount()">← 마이페이지로 돌아가기</button><div class="account-warning account-danger"><strong>회원탈퇴 시 통합회원 계정과 연결된 서비스 이용 정보가 함께 처리됩니다.</strong></div><ul class="account-check-list"><li>탈퇴 후 동일 아이디의 복구는 불가능합니다.</li><li>법령상 보관 의무가 있는 정보는 정해진 기간 동안 분리 보관됩니다.</li><li>진행 중인 기부 및 영수증 발급 내역은 관련 법령에 따라 보관될 수 있습니다.</li><li>각 서비스에 별도로 제출한 신청 정보의 처리 여부를 확인해 주세요.</li></ul><div class="fg" style="margin-top:22px"><label class="fl" for="withdrawPw">비밀번호 확인</label><input class="fi" id="withdrawPw" type="password" placeholder="현재 비밀번호를 입력해 주세요"></div><label class="member-edit-consent-check withdraw-agree-row" style="margin-top:14px"><input type="checkbox" id="withdrawAgree"><span>안내 내용을 모두 확인했으며 회원탈퇴에 동의합니다.</span></label><div class="account-flow-actions"><button class="btn btn-s" onclick="showMembershipAccount()">취소</button><button class="btn account-danger-btn" onclick="confirmWithdrawMember()">회원탈퇴</button></div>`))};
  window.confirmWithdrawMember=function(){const pw=document.getElementById('withdrawPw')?.value||'',ag=!!document.getElementById('withdrawAgree')?.checked;if(!pw){toast('비밀번호를 입력해 주세요.');return}if(!ag){toast('회원탈퇴 안내 확인에 동의해 주세요.');return}if(!confirm('정말 회원탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.'))return;loggedIn=false;try{localStorage.removeItem('nccfMembershipLogin');sessionStorage.removeItem('nccfMembershipLogin')}catch(e){}renderBanner();setMembershipPageTitle(false);setPage(shell('회원탈퇴 완료','회원탈퇴 처리가 완료되었습니다.',`<div class="account-result"><div class="account-complete-icon">✓</div><strong>그동안 함께해 주셔서 감사합니다.</strong><p>탈퇴 처리일: ${new Date().toLocaleDateString('ko-KR')}<br>다시 이용하시려면 신규 회원가입이 필요합니다.</p></div><div class="account-flow-actions"><button class="btn btn-p" onclick="showMembershipLogin()">확인</button></div>`))};

  function wire(){
    document.querySelectorAll('.membership-login-links button').forEach(b=>{const t=b.textContent.trim();if(t==='아이디 찾기')b.onclick=showFindId;if(t==='비밀번호 찾기')b.onclick=showFindPassword});
    document.querySelectorAll('button').forEach(b=>{const t=b.textContent.trim();if(t==='비밀번호 변경')b.onclick=showChangePassword;if(t==='회원탈퇴')b.onclick=showWithdrawMember});
    document.querySelectorAll('#modal a').forEach(a=>{const t=a.textContent.trim();if(t==='아이디 찾기')a.onclick=e=>{e.preventDefault();closeM();setTimeout(()=>{goMembershipSite();showFindId()},80)};if(t==='비밀번호 찾기')a.onclick=e=>{e.preventDefault();closeM();setTimeout(()=>{goMembershipSite();showFindPassword()},80)}})
  }
  const obs=new MutationObserver(()=>wire());obs.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('DOMContentLoaded',wire);setTimeout(wire,0);
  window.shell=shell;
  window.field=field;
  window.setPage=setPage;
  window.codeRow=codeRow;
  /* Account recovery helpers are used by later consolidated recovery renderers. */
  window.stopVerifyTimer=stopVerifyTimer;
  window.startVerifyTimer=startVerifyTimer;
  window.isVerifyValid=isVerifyValid;
  window.startVerifyTimer=startVerifyTimer;
})();

;

(function(){
  const securityNotice=`<div class="account-security-notice">※ 개인정보 보호를 위해 아이디와 이메일의 일치 여부는 별도로 안내하지 않습니다. 회원가입 시 등록한 아이디와 이메일을 정확히 입력한 경우에만 인증번호를 받을 수 있습니다.</div>`;

  window.sendFindPwCode=function(){
    const id=(document.getElementById('findPwId')?.value||'').trim();
    const e=(document.getElementById('findPwEmail')?.value||'').trim();
    if(!id||!/^\S+@\S+\.\S+$/.test(e)){alert('아이디와 이메일 주소를 정확히 입력해 주세요.');return;}
    setPage(shell('비밀번호 찾기','입력한 이메일로 발송된 인증번호를 입력해 주세요.',`${codeRow('findPw')}${securityNotice}<div class="account-flow-actions"><button class="btn btn-s" onclick="showFindPassword()">이전</button><button class="btn btn-p" onclick="verifyFindPw()">인증 확인</button></div>`));
    startVerifyTimer('findPw');
    toast('이메일 인증번호를 발송했습니다. 유효시간은 30분입니다. (데모: 123456)');
  };

  function passwordMarkup(resetMode){
    return `${resetMode?'':field('currentAccountPw','현재 비밀번호','password','현재 비밀번호를 입력해 주세요')}
      <div class="fg password-policy-field">
        <label class="fl" for="signupPassword">비밀번호<span class="rq">*</span></label>
        <input class="fi" id="signupPassword" type="password" autocomplete="new-password" placeholder="영문 대·소문자, 숫자, 특수문자 중 3종류 이상 · 8자리 이상" oninput="updateAccountPasswordUI()">
        <div class="password-policy-box" aria-live="polite">
          <div class="password-policy-title">비밀번호 설정 규칙</div>
          <div id="pwRuleLength" class="password-rule">• 3종류 이상 조합 시 8자리 이상</div>
          <div id="pwRuleTypes" class="password-rule">• 영문 대문자·소문자·숫자·특수문자 중 3종류 이상 조합</div>
          <div id="pwRuleWeak" class="password-rule">• 반복 문자, 연속 숫자, 키보드 배열, 생일·전화번호 등 추측하기 쉬운 조합 사용 불가</div>
        </div>
      </div>
      <div class="fg">
        <label class="fl" for="signupPasswordConfirm">비밀번호 확인<span class="rq">*</span></label>
        <input class="fi" id="signupPasswordConfirm" type="password" autocomplete="new-password" placeholder="비밀번호 재입력" oninput="updateAccountPasswordUI()">
        <div id="pwMatchMessage" class="password-match-message"></div>
      </div>
      <div class="password-management-note"><strong>비밀번호 관리 정책</strong><span>6개월마다 변경하며, 직전 비밀번호 및 최근 12개월 내 사용한 비밀번호는 재사용할 수 없습니다. 초기 비밀번호는 최초 접속 시 변경해야 하며, 비밀번호 변경 후 최소 1일 동안 재변경할 수 없습니다.</span></div>`;
  }

  window.updateAccountPasswordUI=function(){
    const pw=document.getElementById('signupPassword')?.value||'';
    const cf=document.getElementById('signupPasswordConfirm')?.value||'';
    const state=getSignupPasswordState(pw);
    const set=(id,ok)=>document.getElementById(id)?.classList.toggle('ok',!!ok);
    set('pwRuleLength',state.lengthOk);set('pwRuleTypes',state.typesOk);set('pwRuleWeak',state.weakOk);
    const msg=document.getElementById('pwMatchMessage');
    if(msg){const same=!!cf&&pw===cf;msg.textContent=cf?(same?'비밀번호가 일치합니다.':'비밀번호가 일치하지 않습니다.'):'';msg.classList.toggle('ok',same);msg.classList.toggle('bad',!!cf&&!same);}
  };

  window.showChangePassword=function(resetMode=false){
    setMembershipPageTitle(!resetMode);
    setPage(shell('비밀번호 변경',resetMode?'이메일 인증이 완료되었습니다. 새로운 비밀번호로 변경해 주세요.':'안전한 계정 이용을 위해 현재 비밀번호를 확인한 후 변경합니다.',`${resetMode?'':'<button class="account-flow-back" onclick="showMembershipAccount()">← 마이페이지로 돌아가기</button>'}${passwordMarkup(resetMode)}<div class="account-flow-actions"><button class="btn btn-s" onclick="${resetMode?'showMembershipLogin()':'showMembershipAccount()'}">취소</button><button class="btn btn-p" onclick="completeChangePassword(${resetMode})">비밀번호 변경</button></div>`));
    setTimeout(updateAccountPasswordUI,0);
  };

  window.showResetPassword=function(){showChangePassword(true)};

  function focusAccountPassword(id){const el=document.getElementById(id);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>el.focus(),250)}}
  function showPasswordSuccess(){
    document.getElementById('accountPasswordSuccessLayer')?.remove();
    const layer=document.createElement('div');layer.id='accountPasswordSuccessLayer';layer.className='account-success-layer';
    layer.innerHTML='<div class="account-success-dialog" role="dialog" aria-modal="true" aria-labelledby="pwSuccessTitle"><div class="account-success-icon">✓</div><h3 id="pwSuccessTitle">비밀번호 변경 완료</h3><p>비밀번호가 정상적으로 변경되었습니다.<br>새 비밀번호로 다시 로그인해 주세요.</p><button class="btn btn-p" type="button" onclick="confirmPasswordSuccess()">확인</button></div>';
    document.body.appendChild(layer);
  }
  window.confirmPasswordSuccess=function(){document.getElementById('accountPasswordSuccessLayer')?.remove();loggedIn=false;try{localStorage.removeItem('nccfMembershipLogin');sessionStorage.removeItem('nccfMembershipLogin')}catch(e){}renderBanner();setMembershipPageTitle(false);showMembershipLogin()};

  window.completeChangePassword=function(resetMode=false){
    const cur=document.getElementById('currentAccountPw')?.value||'';
    const pw=document.getElementById('signupPassword')?.value||'';
    const cf=document.getElementById('signupPasswordConfirm')?.value||'';
    if(!resetMode&&!cur){alert('현재 비밀번호를 입력해 주세요.');focusAccountPassword('currentAccountPw');return;}
    if(!resetMode&&!['password','••••••••'].includes(cur)){alert('현재 비밀번호가 일치하지 않습니다.');focusAccountPassword('currentAccountPw');return;}
    if(!pw){alert('비밀번호를 입력해 주세요.');focusAccountPassword('signupPassword');return;}
    const state=getSignupPasswordState(pw);
    if(!state.valid){updateAccountPasswordUI();alert('비밀번호 설정 규칙을 확인해 주세요.');focusAccountPassword('signupPassword');return;}
    if(!cf){alert('비밀번호를 다시 입력해 주세요.');focusAccountPassword('signupPasswordConfirm');return;}
    if(pw!==cf){updateAccountPasswordUI();alert('비밀번호 확인이 일치하지 않습니다.');focusAccountPassword('signupPasswordConfirm');return;}
    if(!resetMode&&cur===pw){alert('현재 비밀번호와 다른 비밀번호를 입력해 주세요.');focusAccountPassword('signupPassword');return;}
    showPasswordSuccess();
  };
})();

;

(function(){
  function accountPasswordState(password){
    const pw=String(password||'');
    const types=[/[A-Z]/.test(pw),/[a-z]/.test(pw),/[0-9]/.test(pw),/[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
    const lengthOk=pw.length>=8;
    const typesOk=types>=3;
    const weakPatterns=[/(.)\1\1/,/0123|1234|2345|3456|4567|5678|6789|7890/,/abcd|bcde|cdef|qwer|asdf|zxcv/i,/^(password|passw0rd|qwerty|admin|welcome)$/i];
    const weakOk=!!pw&&!weakPatterns.some(rx=>rx.test(pw));
    return {lengthOk,typesOk,weakOk,valid:lengthOk&&typesOk&&weakOk};
  }
  window.updateAccountPasswordUI=function(){
    const pw=document.getElementById('signupPassword')?.value||'';
    const cf=document.getElementById('signupPasswordConfirm')?.value||'';
    const state=accountPasswordState(pw);
    const set=(id,ok)=>{const el=document.getElementById(id);if(el)el.classList.toggle('ok',!!ok)};
    set('pwRuleLength',state.lengthOk);set('pwRuleTypes',state.typesOk);set('pwRuleWeak',state.weakOk);
    const msg=document.getElementById('pwMatchMessage');
    if(msg){const same=!!cf&&pw===cf;msg.textContent=cf?(same?'비밀번호가 일치합니다.':'비밀번호가 일치하지 않습니다.'):'';msg.classList.toggle('ok',same);msg.classList.toggle('bad',!!cf&&!same);}
  };
  function focusField(id){const el=document.getElementById(id);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>el.focus(),200)}}
  window.completeChangePassword=function(resetMode=false){
    const cur=document.getElementById('currentAccountPw')?.value||'';
    const pw=document.getElementById('signupPassword')?.value||'';
    const cf=document.getElementById('signupPasswordConfirm')?.value||'';
    if(!resetMode&&!cur){alert('현재 비밀번호를 입력해 주세요.');focusField('currentAccountPw');return;}
    if(!resetMode&&!['password','••••••••'].includes(cur)){alert('현재 비밀번호가 일치하지 않습니다.');focusField('currentAccountPw');return;}
    if(!pw){alert('비밀번호를 입력해 주세요.');focusField('signupPassword');return;}
    const state=accountPasswordState(pw);
    if(!state.valid){updateAccountPasswordUI();alert('비밀번호 설정 규칙을 확인해 주세요.');focusField('signupPassword');return;}
    if(!cf){alert('비밀번호를 다시 입력해 주세요.');focusField('signupPasswordConfirm');return;}
    if(pw!==cf){updateAccountPasswordUI();alert('비밀번호 확인이 일치하지 않습니다.');focusField('signupPasswordConfirm');return;}
    if(!resetMode&&cur===pw){alert('현재 비밀번호와 다른 비밀번호를 입력해 주세요.');focusField('signupPassword');return;}
    const old=document.getElementById('accountPasswordSuccessLayer');if(old)old.remove();
    const layer=document.createElement('div');layer.id='accountPasswordSuccessLayer';layer.className='account-success-layer';
    layer.innerHTML='<div class="account-success-dialog" role="dialog" aria-modal="true" aria-labelledby="pwSuccessTitle"><div class="account-success-icon">✓</div><h3 id="pwSuccessTitle">비밀번호 변경 완료</h3><p>비밀번호가 정상적으로 변경되었습니다.<br>새 비밀번호로 다시 로그인해 주세요.</p><button class="btn btn-p" type="button" id="passwordSuccessConfirmBtn">확인</button></div>';
    document.body.appendChild(layer);
    document.getElementById('passwordSuccessConfirmBtn').addEventListener('click',function(){
      layer.remove();
      try{localStorage.removeItem('nccfMembershipLogin');sessionStorage.removeItem('nccfMembershipLogin')}catch(e){}
      if(typeof window.showMembershipLogin==='function')window.showMembershipLogin();
    });
  };
})();

;

(function(){
  function getPasswordState(password){
    const pw=String(password||'');
    const typeCount=[/[A-Z]/.test(pw),/[a-z]/.test(pw),/[0-9]/.test(pw),/[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
    const weak=[/(.)\1\1/,/0123|1234|2345|3456|4567|5678|6789|7890/,/abcd|bcde|cdef|qwer|asdf|zxcv/i,/^(password|passw0rd|qwerty|admin|welcome)$/i].some(rx=>rx.test(pw));
    return {valid:pw.length>=8&&typeCount>=3&&!weak};
  }
  function moveFocus(id){
    const el=document.getElementById(id);
    if(!el)return;
    el.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(function(){el.focus();},200);
  }
  function openSuccessLayer(){
    const old=document.getElementById('accountPasswordSuccessLayer');
    if(old)old.remove();
    const layer=document.createElement('div');
    layer.id='accountPasswordSuccessLayer';
    layer.setAttribute('role','presentation');
    layer.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.52);padding:20px;';
    layer.innerHTML='<div role="dialog" aria-modal="true" aria-labelledby="pwSuccessTitle" style="width:min(420px,100%);background:#fff;border:1px solid #111;box-shadow:0 24px 70px rgba(0,0,0,.28);padding:32px;text-align:center;"><div style="width:54px;height:54px;margin:0 auto 18px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#111;color:#fff;font-size:25px;font-weight:900;">✓</div><h3 id="pwSuccessTitle" style="font-size:20px;margin:0 0 9px;">비밀번호 변경 완료</h3><p style="font-size:13px;line-height:1.7;color:#666;margin:0 0 22px;">비밀번호가 정상적으로 변경되었습니다.<br>새 비밀번호로 다시 로그인해 주세요.</p><button type="button" id="v109PasswordSuccessConfirm" style="width:100%;height:46px;border:1px solid #111;background:#111;color:#fff;font-weight:800;cursor:pointer;">확인</button></div>';
    document.body.appendChild(layer);
    const confirmBtn=document.getElementById('v109PasswordSuccessConfirm');
    confirmBtn.addEventListener('click',function(){
      layer.remove();
      try{localStorage.removeItem('nccfMembershipLogin');sessionStorage.removeItem('nccfMembershipLogin')}catch(e){}
      if(typeof window.loggedIn!=='undefined')window.loggedIn=false;
      if(typeof window.renderBanner==='function')window.renderBanner();
      if(typeof window.setMembershipPageTitle==='function')window.setMembershipPageTitle(false);
      if(typeof window.showMembershipLogin==='function')window.showMembershipLogin();
    },{once:true});
    setTimeout(function(){confirmBtn.focus();},0);
  }
  window.completeChangePassword=function(resetMode){
    resetMode=resetMode===true;
    const cur=(document.getElementById('currentAccountPw')?.value||'').trim();
    const pw=document.getElementById('signupPassword')?.value||'';
    const cf=document.getElementById('signupPasswordConfirm')?.value||'';
    if(!resetMode&&!cur){alert('현재 비밀번호를 입력해 주세요.');moveFocus('currentAccountPw');return;}
    if(!resetMode&&!['password','••••••••'].includes(cur)){alert('현재 비밀번호가 일치하지 않습니다.');moveFocus('currentAccountPw');return;}
    if(!pw){alert('비밀번호를 입력해 주세요.');moveFocus('signupPassword');return;}
    if(!getPasswordState(pw).valid){if(typeof window.updateAccountPasswordUI==='function')window.updateAccountPasswordUI();alert('비밀번호 설정 규칙을 확인해 주세요.');moveFocus('signupPassword');return;}
    if(!cf){alert('비밀번호를 다시 입력해 주세요.');moveFocus('signupPasswordConfirm');return;}
    if(pw!==cf){if(typeof window.updateAccountPasswordUI==='function')window.updateAccountPasswordUI();alert('비밀번호 확인이 일치하지 않습니다.');moveFocus('signupPasswordConfirm');return;}
    if(!resetMode&&cur===pw){alert('현재 비밀번호와 다른 비밀번호를 입력해 주세요.');moveFocus('signupPassword');return;}
    openSuccessLayer();
  };
  // Capture the button click even if an older inline handler is shadowed by another script.
  document.addEventListener('click',function(e){
    const btn=e.target.closest('button');
    if(!btn||btn.textContent.trim()!=='비밀번호 변경')return;
    const area=btn.closest('.account-flow-actions');
    if(!area||!document.getElementById('signupPassword'))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const resetMode=!document.getElementById('currentAccountPw');
    window.completeChangePassword(resetMode);
  },true);
})();

;

(function(){
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  window.toggleWithdrawOtherReason=function(){
    const checked=document.querySelector('input[name="withdrawReason"]:checked');
    const wrap=document.getElementById('withdrawOtherWrap');
    if(!wrap)return;
    wrap.classList.toggle('show',checked?.value==='기타');
    if(checked?.value!=='기타'){
      const field=document.getElementById('withdrawOtherReason');
      if(field)field.value='';
    }
  };
  window.showWithdrawMember=function(){
    setMembershipPageTitle(true);
    setPage(shell('회원탈퇴','탈퇴 전 아래 내용을 반드시 확인해 주세요.',`
      <div class="account-warning account-danger"><strong>회원탈퇴 후에는 계정을 복구할 수 없습니다.</strong></div>
      <div class="withdraw-guide">
        <strong>탈퇴 전 확인사항</strong>
        <ul>
          <li>탈퇴 후 동일한 아이디와 기존 이용 기록은 복구되지 않습니다.</li>
          <li>관련 법령에 따라 보관이 필요한 정보는 정해진 기간 동안 안전하게 분리 보관됩니다.</li>
          <li>기부 내역과 기부금 영수증 관련 정보는 관계 법령에 따라 일정 기간 보관될 수 있습니다.</li>
          <li>진행 중인 신청이나 문의가 있다면 처리 상태를 확인한 후 탈퇴해 주세요.</li>
        </ul>
      </div>
      <div class="fg" style="margin-top:22px">
        <label class="fl">탈퇴 사유 <span class="rq">*</span></label>
        <div class="withdraw-reason-list" role="radiogroup" aria-label="탈퇴 사유">
          ${['서비스 이용 빈도가 낮음','원하는 콘텐츠 또는 혜택이 부족함','서비스 이용이 불편함','개인정보 및 보안이 우려됨','다른 계정을 이용할 예정임','기타'].map((r,i)=>`<label class="withdraw-reason-item"><input type="radio" name="withdrawReason" value="${r}" onchange="toggleWithdrawOtherReason()"><span>${r}</span></label>`).join('')}
        </div>
        <div class="withdraw-other-wrap" id="withdrawOtherWrap">
          <label class="fl" for="withdrawOtherReason">기타 사유 <span class="rq">*</span></label>
          <textarea class="fi" id="withdrawOtherReason" rows="4" maxlength="300" placeholder="탈퇴 사유를 입력해 주세요."></textarea>
        </div>
      </div>
      <div class="fg" style="margin-top:20px">
        <label class="fl" for="withdrawPw">현재 비밀번호 <span class="rq">*</span></label>
        <input class="fi" id="withdrawPw" type="password" autocomplete="current-password" placeholder="현재 비밀번호를 입력해 주세요">
      </div>
      <label class="member-edit-consent-check withdraw-agree-row" style="margin-top:14px"><input type="checkbox" id="withdrawAgree"><span>안내 내용을 모두 확인했으며 회원탈퇴에 동의합니다.</span></label>
      <div class="account-flow-actions"><button class="btn btn-s" type="button" onclick="showMembershipAccount()">취소</button><button class="btn account-danger-btn" type="button" onclick="confirmWithdrawMember()">회원탈퇴</button></div>
    `));
  };
  window.confirmWithdrawMember=function(){
    const reason=document.querySelector('input[name="withdrawReason"]:checked');
    const other=document.getElementById('withdrawOtherReason');
    const pw=document.getElementById('withdrawPw');
    const agree=document.getElementById('withdrawAgree');
    if(!reason){alert('탈퇴 사유를 선택해 주세요.');document.querySelector('input[name="withdrawReason"]')?.focus();return;}
    if(reason.value==='기타' && !other?.value.trim()){alert('기타 탈퇴 사유를 입력해 주세요.');other?.focus();return;}
    if(!pw?.value){alert('현재 비밀번호를 입력해 주세요.');pw?.focus();return;}
    if(!['password','••••••••'].includes(pw.value)){alert('현재 비밀번호가 일치하지 않습니다.');pw.focus();return;}
    if(!agree?.checked){alert('회원탈퇴 안내 확인에 동의해 주세요.');agree?.focus();return;}
    openWithdrawConfirmLayer(reason.value, other?.value.trim()||'');
  };
  window.openWithdrawConfirmLayer=function(reason,other){
    document.getElementById('withdrawConfirmLayer')?.remove();
    const layer=document.createElement('div');
    layer.id='withdrawConfirmLayer';
    layer.className='withdraw-confirm-layer';
    layer.innerHTML=`<div class="withdraw-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="withdrawConfirmTitle"><h3 id="withdrawConfirmTitle">정말 회원탈퇴를 진행하시겠습니까?</h3><p>탈퇴 후에는 계정과 기존 이용 기록을 복구할 수 없습니다.<br>계속 진행하려면 아래의 <strong>회원탈퇴</strong> 버튼을 선택해 주세요.</p><div class="withdraw-confirm-actions"><button class="btn btn-s" type="button" id="withdrawCancelFinal">취소</button><button class="btn account-danger-btn" type="button" id="withdrawConfirmFinal">회원탈퇴</button></div></div>`;
    document.body.appendChild(layer);
    document.getElementById('withdrawCancelFinal').onclick=()=>layer.remove();
    document.getElementById('withdrawConfirmFinal').onclick=()=>completeWithdrawMember(reason,other);
  };
  window.completeWithdrawMember=function(reason,other){
    document.getElementById('withdrawConfirmLayer')?.remove();
    loggedIn=false;
    try{localStorage.removeItem('nccfMembershipLogin');sessionStorage.removeItem('nccfMembershipLogin')}catch(e){}
    renderBanner();setMembershipPageTitle(false);
    setPage(shell('회원탈퇴 완료','회원탈퇴 처리가 완료되었습니다.',`<div class="account-result"><div class="account-complete-icon">✓</div><strong>그동안 함께해 주셔서 감사합니다.</strong><p>탈퇴 처리일: ${new Date().toLocaleDateString('ko-KR')}<br>다시 이용하시려면 새로 회원가입해 주세요.</p></div><div class="account-flow-actions"><button class="btn btn-p" type="button" onclick="showMembershipLogin()">확인</button></div>`));
  };
})();

;

(function(){
  document.addEventListener('click', function(event){
    const button=event.target.closest('button');
    if(!button) return;

    /* Final confirmation-layer buttons retain their own handlers. */
    if(button.closest('#withdrawConfirmLayer')) return;

    /* Only intercept the actual submit button inside the rendered withdrawal form. */
    const isWithdrawalSubmit=
      button.classList.contains('account-danger-btn') &&
      button.textContent.trim()==='회원탈퇴' &&
      document.getElementById('withdrawPw') &&
      document.querySelector('input[name="withdrawReason"]');

    if(!isWithdrawalSubmit) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.confirmWithdrawMember();
  }, true);
})();

;

(function(){
  const isEn=()=>typeof getMembershipLang==='function'&&getMembershipLang()==='en';
  const tr=(ko,en)=>isEn()?en:ko;

  const koReasons=['서비스 이용 빈도가 낮음','원하는 콘텐츠 또는 혜택이 부족함','서비스 이용이 불편함','개인정보 및 보안이 우려됨','다른 계정을 이용할 예정임'];
  const enReasons=['I rarely use the service','The available content or benefits do not meet my needs','The service is inconvenient to use','I have privacy or security concerns','I plan to use another account'];

  window.toggleWithdrawOtherReason=function(){};
  window.showWithdrawMember=function(){
    setMembershipPageTitle(true);
    const reasons=(isEn()?enReasons:koReasons).map(r=>`<label class="withdraw-reason-item"><input type="radio" name="withdrawReason" value="${r}"><span>${r}</span></label>`).join('');
    setPage(shell(
      tr('회원탈퇴','Delete Account'),
      tr('탈퇴 전 아래 내용을 반드시 확인해 주세요.','Please review the following information before deleting your account.'),
      `<div class="account-warning account-danger"><strong>${tr('회원탈퇴 후에는 계정을 복구할 수 없습니다.','Your account cannot be restored after deletion.')}</strong></div>
      <div class="withdraw-guide">
        <strong>${tr('탈퇴 전 확인사항','Before you delete your account')}</strong>
        <ul>
          <li>${tr('탈퇴 후 동일한 아이디와 기존 이용 기록은 복구되지 않습니다.','Your user ID and previous activity history cannot be restored after deletion.')}</li>
          <li>${tr('관련 법령에 따라 보관이 필요한 정보는 정해진 기간 동안 안전하게 분리 보관됩니다.','Information required by law will be securely retained for the prescribed period.')}</li>
          <li>${tr('기부 내역과 기부금 영수증 관련 정보는 관계 법령에 따라 일정 기간 보관될 수 있습니다.','Donation and receipt records may be retained for a certain period as required by law.')}</li>
          <li>${tr('진행 중인 신청이나 문의가 있다면 처리 상태를 확인한 후 탈퇴해 주세요.','Please check the status of any pending requests or inquiries before deleting your account.')}</li>
        </ul>
      </div>
      <div class="fg" style="margin-top:22px">
        <label class="fl">${tr('탈퇴 사유','Reason for leaving')} <span class="rq">*</span></label>
        <div class="withdraw-reason-list" role="radiogroup" aria-label="${tr('탈퇴 사유','Reason for leaving')}">${reasons}</div>
      </div>
      <div class="fg" style="margin-top:20px">
        <label class="fl" for="withdrawPw">${tr('현재 비밀번호','Current password')} <span class="rq">*</span></label>
        <input class="fi" id="withdrawPw" type="password" autocomplete="current-password" placeholder="${tr('현재 비밀번호를 입력해 주세요','Enter your current password')}">
        <span class="withdraw-password-demo">${tr('데모 현재 비밀번호는 password입니다.','Demo current password: password')}</span>
      </div>
      <label class="member-edit-consent-check withdraw-agree-row" style="margin-top:14px"><input type="checkbox" id="withdrawAgree"><span>${tr('안내 내용을 모두 확인했으며 회원탈퇴에 동의합니다.','I have reviewed the information above and agree to delete my account.')}</span></label>
      <div class="account-flow-actions"><button class="btn btn-s" type="button" onclick="showMembershipAccount()">${tr('취소','Cancel')}</button><button class="btn account-danger-btn" type="button" onclick="confirmWithdrawMember()">${tr('회원탈퇴','Delete Account')}</button></div>`
    ));
  };

  window.confirmWithdrawMember=function(){
    const reason=document.querySelector('input[name="withdrawReason"]:checked');
    const pw=document.getElementById('withdrawPw');
    const agree=document.getElementById('withdrawAgree');
    if(!reason){alert(tr('탈퇴 사유를 선택해 주세요.','Please select a reason for leaving.'));document.querySelector('input[name="withdrawReason"]')?.focus();return;}
    if(!pw?.value){alert(tr('현재 비밀번호를 입력해 주세요.','Please enter your current password.'));pw?.focus();return;}
    if(pw.value!=='password'){alert(tr('현재 비밀번호가 일치하지 않습니다.','The current password is incorrect.'));pw.focus();return;}
    if(!agree?.checked){alert(tr('회원탈퇴 안내 확인에 동의해 주세요.','Please confirm that you have reviewed the account deletion information.'));agree?.focus();return;}
    openWithdrawConfirmLayer(reason.value,'');
  };

  window.openWithdrawConfirmLayer=function(reason){
    document.getElementById('withdrawConfirmLayer')?.remove();
    const layer=document.createElement('div');
    layer.id='withdrawConfirmLayer';layer.className='withdraw-confirm-layer';
    layer.innerHTML=`<div class="withdraw-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="withdrawConfirmTitle"><h3 id="withdrawConfirmTitle">${tr('정말 회원탈퇴를 진행하시겠습니까?','Are you sure you want to delete your account?')}</h3><p>${tr('탈퇴 후에는 계정과 기존 이용 기록을 복구할 수 없습니다.','Your account and previous activity history cannot be restored after deletion.')}<br>${tr('계속 진행하려면 아래의 회원탈퇴 버튼을 선택해 주세요.','Select Delete Account below to continue.')}</p><div class="withdraw-confirm-actions"><button class="btn btn-s" type="button" id="withdrawCancelFinal">${tr('취소','Cancel')}</button><button class="btn account-danger-btn" type="button" id="withdrawConfirmFinal">${tr('회원탈퇴','Delete Account')}</button></div></div>`;
    document.body.appendChild(layer);
    document.getElementById('withdrawCancelFinal').onclick=()=>layer.remove();
    document.getElementById('withdrawConfirmFinal').onclick=()=>completeWithdrawMember(reason,'');
  };

  window.completeWithdrawMember=function(){
    document.getElementById('withdrawConfirmLayer')?.remove();
    loggedIn=false;
    try{localStorage.removeItem('nccfMembershipLogin');sessionStorage.removeItem('nccfMembershipLogin')}catch(e){}
    renderBanner();setMembershipPageTitle(false);
    setPage(shell(tr('회원탈퇴 완료','Account Deleted'),tr('회원탈퇴 처리가 완료되었습니다.','Your account has been deleted.'),`<div class="account-result"><div class="account-complete-icon">✓</div><strong>${tr('그동안 함께해 주셔서 감사합니다.','Thank you for being with us.')}</strong><p>${tr('탈퇴 처리일','Deletion date')}: ${new Date().toLocaleDateString(isEn()?'en-US':'ko-KR')}<br>${tr('다시 이용하시려면 새로 회원가입해 주세요.','To use the service again, please create a new account.')}</p></div><div class="account-flow-actions"><button class="btn btn-p" type="button" onclick="showMembershipLogin()">${tr('확인','OK')}</button></div>`));
  };

  const translations=new Map([
    ['아이디 찾기','Find User ID'],['비밀번호 찾기','Reset Password'],['새 비밀번호 설정','Set New Password'],['비밀번호 변경','Change Password'],
    ['회원가입 시 등록한 이메일 인증을 통해 아이디를 확인할 수 있습니다.','Verify your registered email address to find your user ID.'],
    ['회원가입 시 등록한 이메일 인증 후 비밀번호 변경 화면으로 이동합니다.','Verify your registered email address to continue to the password change screen.'],
    ['이름','Name'],['아이디','User ID'],['이메일','Email'],['이메일 인증번호 받기','Send Verification Code'],['인증번호','Verification code'],['재발송','Resend'],['인증 확인','Verify'],['이전','Previous'],['취소','Cancel'],['확인','OK'],
    ['현재 비밀번호','Current password'],['새 비밀번호','New password'],['새 비밀번호 확인','Confirm new password'],['비밀번호 변경','Change Password'],['비밀번호 재설정','Reset Password'],
    ['비밀번호 관리 안내','Password guidance'],['직전 비밀번호와 최근 사용한 비밀번호는 재사용할 수 없습니다.','You cannot reuse your previous or recently used passwords.'],
    ['데모 인증번호는 123456입니다.','Demo verification code: 123456'],['유효시간','Time remaining'],
    ['개인정보 보호를 위해 이름과 이메일의 일치 여부는 별도로 안내하지 않습니다. 회원가입 시 등록한 이름과 이메일을 정확히 입력한 경우에만 인증번호를 받을 수 있습니다.','For privacy protection, we do not indicate whether the name and email address match our records. A verification code is sent only when the registered name and email address are entered correctly.'],
    ['개인정보 보호를 위해 아이디와 이메일의 일치 여부는 별도로 안내하지 않습니다. 회원가입 시 등록한 아이디와 이메일을 정확히 입력한 경우에만 인증번호를 받을 수 있습니다.','For privacy protection, we do not indicate whether the user ID and email address match our records. A verification code is sent only when the registered user ID and email address are entered correctly.']
  ]);
  function localize(root=document){
    if(!isEn())return;
    root.querySelectorAll?.('*').forEach(el=>{
      if(el.children.length===0){const v=el.textContent.trim();if(translations.has(v))el.textContent=translations.get(v);}
      ['placeholder','aria-label','title'].forEach(a=>{const v=el.getAttribute?.(a);if(v&&translations.has(v))el.setAttribute(a,translations.get(v));});
    });
  }
  const obs=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)localize(n)})));
  if(document.body)obs.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>{localize(document);obs.observe(document.body,{childList:true,subtree:true})},{once:true});
})();

;

(function(){
  const isEn=()=>typeof getMembershipLang==='function'&&getMembershipLang()==='en';
  const tr=(ko,en)=>isEn()?en:ko;
  let resetAuthorizationPending=false;

  const originalVerifyFindPw=window.verifyFindPw;
  window.verifyFindPw=function(){
    const code=(document.getElementById('findPwCode')?.value||'').trim();
    if(typeof originalVerifyFindPw==='function'){
      // Reimplement the final branch so reset authorization is one-time only.
      const timer=document.getElementById('findPwTimer');
      if(timer?.classList.contains('expired')){alert(tr('인증번호 유효시간이 만료되었습니다. 다시 발송해 주세요.','The verification code has expired. Please request a new code.'));return;}
      if(code!=='123456'){alert(tr('인증번호가 일치하지 않습니다.','The verification code is incorrect.'));return;}
      resetAuthorizationPending=true;
      showChangePassword(true);
    }
  };

  function passwordMarkup(resetMode){
    return `${resetMode?'':`<div class="fg"><label class="fl" for="currentAccountPw">${tr('현재 비밀번호','Current password')}<span class="rq">*</span></label><input class="fi" id="currentAccountPw" type="password" autocomplete="current-password" placeholder="${tr('현재 비밀번호를 입력해 주세요','Enter your current password')}"><div class="account-verify-demo" style="margin-top:7px">${tr('데모 현재 비밀번호는 password입니다.','Demo current password: password')}</div></div>`}
      <div class="fg password-policy-field"><label class="fl" for="signupPassword">${tr('새 비밀번호','New password')}<span class="rq">*</span></label><input class="fi" id="signupPassword" type="password" autocomplete="new-password" placeholder="${tr('영문 대·소문자, 숫자, 특수문자 중 3종류 이상 · 8자리 이상','Use at least 3 character types and 8 characters')}" oninput="updateAccountPasswordUI()"><div class="password-policy-box" aria-live="polite"><div class="password-policy-title">${tr('비밀번호 설정 규칙','Password requirements')}</div><div id="pwRuleLength" class="password-rule">${tr('• 3종류 이상 조합 시 8자리 이상','• At least 8 characters using 3 or more character types')}</div><div id="pwRuleTypes" class="password-rule">${tr('• 영문 대문자·소문자·숫자·특수문자 중 3종류 이상 조합','• Use at least 3 of uppercase, lowercase, numbers, and symbols')}</div><div id="pwRuleWeak" class="password-rule">${tr('• 반복 문자, 연속 숫자, 키보드 배열, 생일·전화번호 등 추측하기 쉬운 조합 사용 불가','• Do not use repeated characters, sequences, keyboard patterns, birthdays, or phone numbers')}</div></div></div>
      <div class="fg"><label class="fl" for="signupPasswordConfirm">${tr('새 비밀번호 확인','Confirm new password')}<span class="rq">*</span></label><input class="fi" id="signupPasswordConfirm" type="password" autocomplete="new-password" placeholder="${tr('비밀번호 재입력','Re-enter your password')}" oninput="updateAccountPasswordUI()"><div id="pwMatchMessage" class="password-match-message"></div></div>
      <div class="password-management-note"><strong>${tr('비밀번호 관리 정책','Password policy')}</strong><span>${tr('6개월마다 변경하며, 직전 비밀번호 및 최근 12개월 내 사용한 비밀번호는 재사용할 수 없습니다. 초기 비밀번호는 최초 접속 시 변경해야 하며, 비밀번호 변경 후 최소 1일 동안 재변경할 수 없습니다.','Change your password every six months. Your previous password and passwords used within the last 12 months cannot be reused. Initial passwords must be changed at first login, and passwords cannot be changed again for at least one day.')}</span></div>`;
  }

  window.showChangePassword=function(requestReset=false){
    const resetMode=!!requestReset&&resetAuthorizationPending;
    resetAuthorizationPending=false; // consume authorization; every re-entry requires verification again
    setMembershipPageTitle(!resetMode);
    setPage(shell(
      tr('비밀번호 변경','Change Password'),
      resetMode?tr('이메일 인증이 완료되었습니다. 새로운 비밀번호로 변경해 주세요.','Email verification is complete. Set a new password.'):tr('안전한 계정 이용을 위해 현재 비밀번호를 확인한 후 변경합니다.','Confirm your current password before changing it.'),
      `${passwordMarkup(resetMode)}<div class="account-flow-actions"><button class="btn btn-s" type="button" onclick="${resetMode?'showMembershipLogin()':'showMembershipAccount()'}">${tr('취소','Cancel')}</button><button class="btn btn-p" type="button" onclick="completeChangePassword(${resetMode})">${tr('비밀번호 변경','Change Password')}</button></div>`
    ));
    setTimeout(()=>window.updateAccountPasswordUI?.(),0);
  };

  // Normal account entry always starts a fresh, logged-in change flow.
  document.addEventListener('click',function(e){
    const b=e.target.closest('button');
    if(!b)return;
    const label=b.textContent.trim();
    if((label==='비밀번호 변경'||label==='Change Password') && !b.closest('.account-flow-shell')){
      resetAuthorizationPending=false;
    }
  },true);

  window.openWithdrawConfirmLayer=function(reason){
    document.getElementById('withdrawConfirmLayer')?.remove();
    const layer=document.createElement('div');
    layer.id='withdrawConfirmLayer';
    layer.className='withdraw-confirm-layer';
    layer.innerHTML=`<div class="withdraw-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="withdrawConfirmTitle"><h3 id="withdrawConfirmTitle">${tr('정말 회원탈퇴를 진행하시겠습니까?','Are you sure you want to delete your account?')}</h3><p>${tr('탈퇴 후에는 계정과 기존 이용 기록을 복구할 수 없습니다.','Your account and previous activity history cannot be restored after deletion.')}<br>${tr('계속 진행하려면 아래의 회원탈퇴 버튼을 선택해 주세요.','Select Delete Account below to continue.')}</p><div class="withdraw-confirm-actions"><button class="btn account-danger-btn" type="button" id="withdrawConfirmFinal">${tr('회원탈퇴','Delete Account')}</button><button class="btn btn-s" type="button" id="withdrawCancelFinal">${tr('취소','Cancel')}</button></div></div>`;
    document.body.appendChild(layer);
    document.getElementById('withdrawConfirmFinal').onclick=()=>completeWithdrawMember(reason,'');
    document.getElementById('withdrawCancelFinal').onclick=()=>layer.remove();
  };
})();

;

(function(){
  const implementedLabels = [
    '로그인','회원가입','아이디 찾기','비밀번호 찾기','비밀번호 변경','회원탈퇴',
    '마이페이지','회원정보 변경','동의관리','Login','Sign Up','Find ID',
    'Find Password','Reset Password','Change Password','Delete Account','My Page',
    'Edit Profile','Consent Management','EN','KO','한국어','English'
  ];

  function normalize(value){
    return String(value||'').replace(/\s+/g,' ').trim();
  }

  function isImplementedControl(el){
    if(!el) return false;
    const text=normalize(el.textContent);
    const aria=normalize(el.getAttribute&&el.getAttribute('aria-label'));
    const title=normalize(el.getAttribute&&el.getAttribute('title'));
    return implementedLabels.some(label=>text===label||aria===label||title===label||text.includes(label));
  }

  function clearStaleBlocker(root){
    (root||document).querySelectorAll('[onclick*="showOutOfScopeNotice"]').forEach(function(el){
      if(isImplementedControl(el) || el.classList.contains('site-lang-btn')){
        el.removeAttribute('onclick');
      }
    });
  }

  function repairLanguageButton(){
    document.querySelectorAll('.site-lang-btn').forEach(function(btn){
      if(btn.dataset.v116Bound==='1') return;
      btn.dataset.v116Bound='1';
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        if(typeof window.toggleLanguage==='function') return window.toggleLanguage();
        if(typeof window.toggleLang==='function') return window.toggleLang();
        const current=(document.documentElement.lang||'ko').toLowerCase().startsWith('en');
        if(typeof window.setLanguage==='function') return window.setLanguage(current?'ko':'en');
      },true);
    });
  }

  function run(){
    clearStaleBlocker(document);
    repairLanguageButton();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);
  else run();

  new MutationObserver(function(){run();}).observe(document.documentElement,{childList:true,subtree:true});

  const original=window.showOutOfScopeNotice;
  window.showOutOfScopeNotice=function(event){
    const target=(event&&event.currentTarget)||(event&&event.target)||document.activeElement;
    if(isImplementedControl(target) || (target&&target.classList&&target.classList.contains('site-lang-btn'))){
      return false;
    }
    return typeof original==='function' ? original.apply(this,arguments) : false;
  };
})();

;

(function(){
  function wireAccountEntryButtons(){
    document.querySelectorAll('.membership-login-links button').forEach(function(btn){
      const text=(btn.textContent||'').replace(/\s+/g,' ').trim();
      if(['아이디 찾기','Find ID','Find User ID'].includes(text)){
        btn.onclick=function(e){if(e)e.preventDefault();window.showFindId();};
      }else if(['비밀번호 찾기','Reset Password','Find Password'].includes(text)){
        btn.onclick=function(e){if(e)e.preventDefault();window.showFindPassword();};
      }
    });
  }
  const originalLogin=window.showMembershipLogin;
  if(typeof originalLogin==='function'){
    window.showMembershipLogin=function(){
      const result=originalLogin.apply(this,arguments);
      setTimeout(wireAccountEntryButtons,0);
      return result;
    };
  }
  function run(){wireAccountEntryButtons();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
})();

;

(function () {
  const isEn = () =>
    typeof window.getMembershipLang === 'function' &&
    window.getMembershipLang() === 'en';

  const tr = (ko, en) => isEn() ? en : ko;

  /* ---------- Public pages: Korean only ---------- */
  const publicKorean = new Map([
    ['About', '재단소개'],
    ['Programs', '재단사업'],
    ['News', '재단소식'],
    ['Suggestions & Inquiries', '제안 및 문의'],
    ['At NC Cultural Foundation', 'NC문화재단에서'],
    ['We invite you to join Gachijieum Membership', '가치지음 멤버십을 찾습니다'],
    ['Overview', '소개'],
    ['Spaces', '공간'],
    ['Membership', '멤버십'],
    ['Careers', '채용'],
    ['Directions', '오시는 길'],
    ['All', '전체'],
    ['Notices', '공지사항'],
    ['Press Releases', '보도자료'],
    ['Social Media', '소셜미디어'],
    ['Learn More', '자세히보기'],
    ['View More', '더 보기']
  ]);

  function restorePublicKorean() {
    const roots = [
      document.querySelector('.site-hd'),
      document.getElementById('homePage'),
      document.getElementById('valuePage')
    ].filter(Boolean);

    roots.forEach(root => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach(node => {
        const raw = node.nodeValue || '';
        const trimmed = raw.trim();
        if (publicKorean.has(trimmed)) {
          node.nodeValue = raw.replace(trimmed, publicKorean.get(trimmed));
        }
      });
    });

    const hero = document.querySelector('#homePage .kv-copy h1');
    if (hero) hero.innerHTML = 'NC문화재단에서<br>가치지음 멤버십을 찾습니다';
  }

  /* ---------- Account messages ---------- */
  const messageMap = new Map([
    ['인증번호가 재발송되었습니다. 유효시간은 30분입니다. (데모: 123456)',
     'A new verification code has been sent. It is valid for 30 minutes. (Demo: 123456)'],
    ['이메일 인증번호를 발송했습니다. 유효시간은 30분입니다. (데모: 123456)',
     'A verification code has been sent. It is valid for 30 minutes. (Demo: 123456)'],
    ['인증번호 유효시간이 만료되었습니다. 다시 발송해 주세요.',
     'The verification code has expired. Please request a new code.'],
    ['인증번호가 일치하지 않습니다.', 'The verification code is incorrect.'],
    ['이메일 인증이 완료되었습니다.', 'Email verification is complete.'],
    ['이름과 이메일 주소를 정확히 입력해 주세요.',
     'Please enter your name and email address correctly.'],
    ['아이디와 이메일 주소를 정확히 입력해 주세요.',
     'Please enter your user ID and email address correctly.'],
    ['현재 비밀번호가 일치하지 않습니다.', 'The current password is incorrect.'],
    ['비밀번호 설정 규칙을 확인해 주세요.', 'Please review the password requirements.'],
    ['비밀번호 확인이 일치하지 않습니다.', 'The passwords do not match.'],
    ['로그인되었습니다.', 'You have signed in successfully.'],
    ['로그인에 성공했습니다.', 'You have signed in successfully.'],
    ['로그아웃되었습니다.', 'You have signed out successfully.'],
    ['로그아웃에 성공했습니다.', 'You have signed out successfully.'],
    ['가입 완료! 자동 로그인되었습니다',
     'Registration is complete. You have been signed in automatically.']
  ]);

  function translateMessage(message) {
    if (!isEn() || message == null) return message;
    const source = String(message);
    const trimmed = source.trim();

    if (messageMap.has(trimmed)) {
      return source.replace(trimmed, messageMap.get(trimmed));
    }

    if (/^.+님 환영합니다!$/.test(trimmed)) {
      return `Welcome, ${trimmed.replace(/님 환영합니다!$/, '')}!`;
    }

    let result = source;
    messageMap.forEach((en, ko) => {
      if (result.includes(ko)) result = result.split(ko).join(en);
    });
    return result;
  }

  const baseToast = window.toast;
  if (typeof baseToast === 'function') {
    window.toast = function (message) {
      return baseToast.call(this, translateMessage(message));
    };
  }

  const baseAlert = window.alert;
  window.alert = function (message) {
    return baseAlert.call(window, translateMessage(message));
  };

  const baseConfirm = window.confirm;
  window.confirm = function (message) {
    return baseConfirm.call(window, translateMessage(message));
  };

  window.resendCode = function (prefix) {
    startVerifyTimer(prefix);
    toast(tr(
      '인증번호가 재발송되었습니다. 유효시간은 30분입니다. (데모: 123456)',
      'A new verification code has been sent. It is valid for 30 minutes. (Demo: 123456)'
    ));
  };

  /* ---------- Find User ID: one implementation ---------- */
  window.showFindId = function () {
    stopVerifyTimer('findId');
    setMembershipPageTitle(false);
    setPage(shell(
      tr('아이디 찾기', 'Find User ID'),
      tr(
        '회원가입 시 등록한 이메일 인증을 통해 아이디를 확인할 수 있습니다.',
        'Verify your registered email address to find your user ID.'
      ),
      `<div class="fg">
        <label class="fl" for="findIdName">${tr('이름', 'Name')}<span class="rq">*</span></label>
        <input class="fi" id="findIdName" type="text" placeholder="${tr('이름을 입력해 주세요', 'Enter your name')}">
      </div>
      <div class="fg">
        <label class="fl" for="findIdEmail">${tr('이메일', 'Email')}<span class="rq">*</span></label>
        <input class="fi" id="findIdEmail" type="email" placeholder="${tr('회원가입 시 등록한 이메일 주소', 'Enter your registered email address')}">
      </div>
      <div class="account-flow-actions">
        <button class="btn btn-s" type="button" onclick="showMembershipLogin()">${tr('취소', 'Cancel')}</button>
        <button class="btn btn-p" type="button" onclick="sendFindIdCode()">${tr('이메일 인증번호 받기', 'Send Verification Code')}</button>
      </div>`
    ));
  };

  window.sendFindIdCode = function () {
    const name = (document.getElementById('findIdName')?.value || '').trim();
    const email = (document.getElementById('findIdEmail')?.value || '').trim();

    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      alert(tr(
        '이름과 이메일 주소를 정확히 입력해 주세요.',
        'Please enter your name and email address correctly.'
      ));
      return;
    }

    setPage(shell(
      tr('아이디 찾기', 'Find User ID'),
      tr(
        '입력한 이메일로 발송된 인증번호를 입력해 주세요.',
        'Enter the verification code sent to your email address.'
      ),
      `${codeRow('findId')}
       <div class="account-security-notice">${tr(
         '※ 개인정보 보호를 위해 이름과 이메일의 일치 여부는 별도로 안내하지 않습니다. 회원가입 시 등록한 이름과 이메일을 정확히 입력한 경우에만 인증번호를 받을 수 있습니다.',
         '※ For privacy protection, we do not indicate whether the name and email address match our records. A verification code is sent only when the registered name and email address are entered correctly.'
       )}</div>
       <div class="account-flow-actions">
         <button class="btn btn-s" type="button" onclick="showFindId()">${tr('이전', 'Previous')}</button>
         <button class="btn btn-p" type="button" id="cleanFindIdVerify">${tr('인증 확인', 'Verify')}</button>
       </div>`
    ));

    const input = document.getElementById('findIdCode');
    if (input && isEn()) input.placeholder = 'Enter the 6-digit code';

    document.getElementById('cleanFindIdVerify')?.addEventListener('click', function () {
      window.completeFindId();
    });

    startVerifyTimer('findId');
    toast(tr(
      '이메일 인증번호를 발송했습니다. 유효시간은 30분입니다. (데모: 123456)',
      'A verification code has been sent. It is valid for 30 minutes. (Demo: 123456)'
    ));
  };

  window.completeFindId = function () {
    const code = (document.getElementById('findIdCode')?.value || '').trim();

    if (!isVerifyValid('findId')) {
      alert(tr(
        '인증번호 유효시간이 만료되었습니다. 다시 발송해 주세요.',
        'The verification code has expired. Please request a new code.'
      ));
      return;
    }
    if (code !== '123456') {
      alert(tr('인증번호가 일치하지 않습니다.', 'The verification code is incorrect.'));
      return;
    }

    stopVerifyTimer('findId');
    setPage(shell(
      tr('아이디 찾기 완료', 'User ID Found'),
      tr('회원님의 아이디를 확인했습니다.', 'Your user ID has been found.'),
      `<div class="account-result">
        <strong>ncc******er</strong>
        <p>${tr('가입일', 'Registration date')} 2026.05.26<br>
        ${tr(
          '개인정보 보호를 위해 아이디 일부를 가려서 안내합니다.',
          'For privacy protection, part of your user ID is masked.'
        )}</p>
      </div>
      <div class="account-flow-actions">
        <button class="btn btn-s" type="button" onclick="showFindPassword()">${tr('비밀번호 찾기', 'Reset Password')}</button>
        <button class="btn btn-p" type="button" onclick="showMembershipLogin()">${tr('로그인', 'Sign In')}</button>
      </div>`
    ));
  };

  /* ---------- Reset Password: one implementation ---------- */
  window.showFindPassword = function () {
    stopVerifyTimer('findPw');
    setMembershipPageTitle(false);
    setPage(shell(
      tr('비밀번호 찾기', 'Reset Password'),
      tr(
        '회원가입 시 등록한 이메일 인증 후 비밀번호 변경 화면으로 이동합니다.',
        'Verify your registered email address to continue to the password reset screen.'
      ),
      `<div class="fg">
        <label class="fl" for="findPwId">${tr('아이디', 'User ID')}<span class="rq">*</span></label>
        <input class="fi" id="findPwId" type="text" placeholder="${tr('아이디를 입력해 주세요', 'Enter your user ID')}">
      </div>
      <div class="fg">
        <label class="fl" for="findPwEmail">${tr('이메일', 'Email')}<span class="rq">*</span></label>
        <input class="fi" id="findPwEmail" type="email" placeholder="${tr('회원가입 시 등록한 이메일 주소', 'Enter your registered email address')}">
      </div>
      <div class="account-flow-actions">
        <button class="btn btn-s" type="button" onclick="showMembershipLogin()">${tr('취소', 'Cancel')}</button>
        <button class="btn btn-p" type="button" onclick="sendFindPwCode()">${tr('이메일 인증번호 받기', 'Send Verification Code')}</button>
      </div>`
    ));
  };

  window.sendFindPwCode = function () {
    const id = (document.getElementById('findPwId')?.value || '').trim();
    const email = (document.getElementById('findPwEmail')?.value || '').trim();

    if (!id || !/^\S+@\S+\.\S+$/.test(email)) {
      alert(tr(
        '아이디와 이메일 주소를 정확히 입력해 주세요.',
        'Please enter your user ID and email address correctly.'
      ));
      return;
    }

    setPage(shell(
      tr('비밀번호 찾기', 'Reset Password'),
      tr(
        '입력한 이메일로 발송된 인증번호를 입력해 주세요.',
        'Enter the verification code sent to your email address.'
      ),
      `${codeRow('findPw')}
       <div class="account-security-notice">${tr(
         '※ 개인정보 보호를 위해 아이디와 이메일의 일치 여부는 별도로 안내하지 않습니다. 회원가입 시 등록한 아이디와 이메일을 정확히 입력한 경우에만 인증번호를 받을 수 있습니다.',
         '※ For privacy protection, we do not indicate whether the user ID and email address match our records. A verification code is sent only when the registered user ID and email address are entered correctly.'
       )}</div>
       <div class="account-flow-actions">
         <button class="btn btn-s" type="button" onclick="showFindPassword()">${tr('이전', 'Previous')}</button>
         <button class="btn btn-p" type="button" id="cleanFindPwVerify">${tr('인증 확인', 'Verify')}</button>
       </div>`
    ));

    const input = document.getElementById('findPwCode');
    if (input && isEn()) input.placeholder = 'Enter the 6-digit code';

    document.getElementById('cleanFindPwVerify')?.addEventListener('click', function () {
      window.verifyFindPw();
    });

    startVerifyTimer('findPw');
    toast(tr(
      '이메일 인증번호를 발송했습니다. 유효시간은 30분입니다. (데모: 123456)',
      'A verification code has been sent. It is valid for 30 minutes. (Demo: 123456)'
    ));
  };

  window.verifyFindPw = function () {
    const code = (document.getElementById('findPwCode')?.value || '').trim();

    if (!isVerifyValid('findPw')) {
      alert(tr(
        '인증번호 유효시간이 만료되었습니다. 다시 발송해 주세요.',
        'The verification code has expired. Please request a new code.'
      ));
      return;
    }
    if (code !== '123456') {
      alert(tr('인증번호가 일치하지 않습니다.', 'The verification code is incorrect.'));
      return;
    }

    stopVerifyTimer('findPw');
    toast(tr('이메일 인증이 완료되었습니다.', 'Email verification is complete.'));
    showChangePassword(true);
  };

  /* Restore Korean public content after language switching/navigation only. */
  function schedulePublicRestore() {
    setTimeout(restorePublicKorean, 0);
    setTimeout(restorePublicKorean, 80);
  }

  document.addEventListener('DOMContentLoaded', schedulePublicRestore);
  document.addEventListener('click', function (event) {
    if (event.target.closest('.site-lang-btn, [data-lang], #langToggle, .lang-toggle, .site-hd a')) {
      schedulePublicRestore();
    }
  }, true);

  schedulePublicRestore();
})();

;

(function(){
  const ORDER=['가','치','지','음'];
  const state={values:{},rolling:false};
  const FACE_ROTATIONS={1:['0deg','0deg'],2:['0deg','-90deg'],3:['-90deg','0deg'],4:['90deg','0deg'],5:['0deg','90deg'],6:['0deg','180deg']};

  function isMemberLoggedIn(){
    try{
      return !!window.loggedIn ||
        localStorage.getItem('nccfMembershipLogin')==='true' ||
        sessionStorage.getItem('nccfMembershipLogin')==='true';
    }catch(e){ return !!window.loggedIn; }
  }

  function faceHTML(n){
    const layouts={
      1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]
    };
    return layouts[n].map(p=>'<span class="gj-pip p'+p+'"></span>').join('');
  }

  function ensureUI(){
    if(!document.querySelector('.gj-game-stage')){
      const stage=document.createElement('div');
      stage.className='gj-game-stage';
      stage.setAttribute('aria-hidden','true');
      stage.innerHTML='<div class="gj-dice-scene"><div class="gj-dice-cube" aria-live="polite"><div class="gj-die-face front">'+faceHTML(1)+'</div><div class="gj-die-face right">'+faceHTML(2)+'</div><div class="gj-die-face top">'+faceHTML(3)+'</div><div class="gj-die-face bottom">'+faceHTML(4)+'</div><div class="gj-die-face left">'+faceHTML(5)+'</div><div class="gj-die-face back">'+faceHTML(6)+'</div></div><div class="gj-dice-shadow"></div></div>';
      document.body.appendChild(stage);
    }
    if(!document.querySelector('.gj-result-layer')){
      const layer=document.createElement('div');
      layer.className='gj-result-layer';
      layer.setAttribute('role','dialog');
      layer.setAttribute('aria-modal','true');
      layer.setAttribute('aria-labelledby','gjResultTitle');
      layer.innerHTML='<div class="gj-result-card"><div class="gj-result-badge">🎉</div><h2 id="gjResultTitle">축하합니다!</h2><p>네 개의 가치 블록을 모두 완성했습니다.<br>오늘의 가치 점수를 확인해 보세요.</p><div class="gj-result-numbers"></div><div class="gj-result-total">오늘의 가치 점수<strong>0</strong></div><button type="button" class="gj-result-close">확인</button></div>';
      document.body.appendChild(layer);
      layer.querySelector('.gj-result-close').addEventListener('click',()=>layer.classList.remove('show'));
      layer.addEventListener('click',e=>{if(e.target===layer) layer.classList.remove('show');});
    }
  }

  function showFinalResult(){
    const vals=ORDER.map(k=>state.values[k]);
    const sum=vals.reduce((a,b)=>a+b,0);
    const layer=document.querySelector('.gj-result-layer');
    const numbers=layer.querySelector('.gj-result-numbers');
    numbers.innerHTML='';
    vals.forEach((v,i)=>{
      const n=document.createElement('span'); n.className='gj-result-num'; n.textContent=String(v); numbers.appendChild(n);
      if(i<vals.length-1){const p=document.createElement('span'); p.className='gj-result-plus'; p.textContent='+'; numbers.appendChild(p);}
    });
    layer.querySelector('.gj-result-total strong').textContent=String(sum)+'점';
    setTimeout(()=>layer.classList.add('show'),280);
  }

  function runCentralDice(tile,original){
    const stage=document.querySelector('.gj-game-stage');
    const scene=stage.querySelector('.gj-dice-scene');
    const cube=stage.querySelector('.gj-dice-cube');
    const value=1+Math.floor(Math.random()*6);
    const rot=FACE_ROTATIONS[value];
    const finalX=parseFloat(rot[0])||0;
    const finalY=parseFloat(rot[1])||0;

    /*
     * Keep the visible result face exact while maintaining constant angular
     * velocity. Every keyframe angle is calculated from elapsed-time ratio,
     * so irregular bounce keyframes cannot accelerate the rotation.
     */
    const startX=-22;
    const startY=18;
    const startZ=-10;
    const endX=finalX+1440;
    const endY=finalY+1440;
    const endZ=360;
    const rollPoints=[0,10,22,34,45,55,65,74,82,89,95,98,100];

    rollPoints.forEach(function(point){
      const ratio=point/100;
      const x=startX+(endX-startX)*ratio;
      const y=startY+(endY-startY)*ratio;
      const z=startZ+(endZ-startZ)*ratio;
      cube.style.setProperty('--roll-x-'+point,x+'deg');
      cube.style.setProperty('--roll-y-'+point,y+'deg');
      cube.style.setProperty('--roll-z-'+point,z+'deg');
    });
    stage.classList.add('show');
    stage.setAttribute('aria-hidden','false');
    scene.classList.remove('rolling');
    void scene.offsetWidth;
    scene.classList.add('rolling');

    setTimeout(()=>{
      state.values[original]=value;
      tile.textContent=String(value);
      tile.setAttribute('aria-label',original+' 블록 결과 '+value+'점, 완료');
      tile.classList.add('gj-dice-done');
      tile.classList.remove('gj-dice-disabled');
      setTimeout(()=>{
        stage.classList.remove('show');
        stage.setAttribute('aria-hidden','true');
        scene.classList.remove('rolling');
        state.rolling=false;
        if(ORDER.every(k=>state.values[k])) showFinalResult();
      },420);
    },1960);
  }

  function rollTile(tile,event){
    event.preventDefault();
    event.stopPropagation();
    if(!isMemberLoggedIn()) return;
    if(state.rolling || tile.classList.contains('gj-dice-done')) return;
    state.rolling=true;
    const original=tile.dataset.originalChar || tile.textContent.trim();
    tile.dataset.originalChar=original;
    runCentralDice(tile,original);
  }

  function syncLoginState(tiles){
    const loggedIn=isMemberLoggedIn();
    tiles.forEach(tile=>tile.classList.toggle('gj-dice-disabled',!loggedIn && !tile.classList.contains('gj-dice-done')));
  }

  function init(){
    ensureUI();
    const tiles=[...document.querySelectorAll('.gj-tumble .gj-tile')];
    if(tiles.length!==4) return;
    tiles.forEach(function(tile,index){
      tile.dataset.originalChar=ORDER[index];
      tile.setAttribute('role','button');
      tile.setAttribute('tabindex','0');
      tile.setAttribute('aria-label',ORDER[index]+' 블록 굴리기');
      tile.addEventListener('click',e=>rollTile(tile,e));
      tile.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ') rollTile(tile,e);});
    });
    syncLoginState(tiles);
    window.addEventListener('storage',()=>syncLoginState(tiles));
    setInterval(()=>syncLoginState(tiles),1000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

;

(function(){
  'use strict';

  var hero = null;
  var heroObserver = null;
  var heroVisible = false;

  function mobile(){
    return window.matchMedia('(max-width:900px)').matches;
  }

  function anchorFloating(){
    var stack=document.querySelector('.floating-stack');
    if(stack && stack.parentElement!==document.body){
      document.body.appendChild(stack);
    }
  }

  function membershipRoot(){
    return document.getElementById('membershipPageView');
  }

  function inferMembershipScreen(){
    var root=membershipRoot();
    if(!root) return 'membership-service';

    if(root.querySelector('.membership-login-panel')) return 'login';

    var heading=(root.querySelector('h1,h2,.account-flow-head h1')?.textContent||'')
      .replace(/\s+/g,' ').trim();

    if(/아이디 찾기|Find ID|Find User ID/i.test(heading)) return 'find-id';
    if(/비밀번호 찾기|Reset Password|Find Password/i.test(heading)) return 'find-password';

    if(root.querySelector('.account-flow-shell')){
      return /아이디/.test(heading) ? 'find-id' :
             /비밀번호/.test(heading) ? 'find-password' : 'membership-service';
    }

    if(root.querySelector('.signup-shell,.signup-step,.membership-signup') ||
       /\b가입\b|Sign[- ]?up/i.test(heading)) return 'signup';

    if(root.querySelector('.mypage,.membership-mypage,.account-dashboard') ||
       /마이페이지|My Page|My Account/i.test(heading)) return 'mypage';

    return 'membership-service';
  }

  function computeScreen(){
    if(document.body.classList.contains('value-page')){
      return 'membership-intro';
    }

    if(document.body.classList.contains('membership-on')){
      return inferMembershipScreen();
    }

    return heroVisible ? 'home-hero' : 'home-content';
  }

  function syncScreen(){
    anchorFloating();
    document.body.dataset.appScreen=computeScreen();
  }

  function observeHero(){
    if(heroObserver) heroObserver.disconnect();
    hero=document.querySelector('.main-hero');

    if(!hero){
      heroVisible=false;
      syncScreen();
      return;
    }

    if('IntersectionObserver' in window){
      heroObserver=new IntersectionObserver(function(entries){
        var entry=entries[0];
        heroVisible=!!entry && entry.isIntersecting &&
          entry.intersectionRect.height>=Math.min(100,Math.max(56,window.innerHeight*.1));
        syncScreen();
      },{threshold:[0,.08,.15,.25]});
      heroObserver.observe(hero);
    }else{
      var r=hero.getBoundingClientRect();
      heroVisible=r.bottom>0 && r.top<window.innerHeight;
      syncScreen();
    }
  }

  /*
   * Direct recovery navigation. The original recovery renderer owns its own
   * DOM; this only closes the modal and calls the renderer without redrawing
   * the login screen in between.
   */
  function enterRecovery(kind){
    var overlay=document.getElementById('ov');
    if(overlay) overlay.classList.remove('open');
    document.body.style.overflow='';

    document.body.classList.remove('value-page');
    document.body.classList.add('membership-on');

    if(kind==='id' && typeof window.showFindId==='function'){
      window.showFindId();
    }else if(kind==='pw' && typeof window.showFindPassword==='function'){
      window.showFindPassword();
    }

    window.scrollTo({top:0,behavior:'auto'});
    requestAnimationFrame(syncScreen);
  }

  window.openAccountRecovery=function(kind){
    enterRecovery(kind==='pw'?'pw':'id');
  };

  function bindRecoveryControls(root){
    (root||document).querySelectorAll('a,button').forEach(function(el){
      var label=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(['아이디 찾기','Find ID','Find User ID'].includes(label)){
        el.onclick=function(e){
          if(e)e.preventDefault();
          enterRecovery('id');
          return false;
        };
      }else if(['비밀번호 찾기','Reset Password','Find Password'].includes(label)){
        el.onclick=function(e){
          if(e)e.preventDefault();
          enterRecovery('pw');
          return false;
        };
      }
    });
  }

  function init(){
    anchorFloating();
    observeHero();
    bindRecoveryControls(document);
    syncScreen();

    var observer=new MutationObserver(function(records){
      anchorFloating();
      bindRecoveryControls(document);
      syncScreen();
    });

    observer.observe(document.body,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class']
    });

    window.addEventListener('resize',function(){
      observeHero();
      syncScreen();
    });
    window.addEventListener('scroll',syncScreen,{passive:true});
    window.addEventListener('hashchange',function(){requestAnimationFrame(syncScreen)});
    window.addEventListener('popstate',function(){requestAnimationFrame(syncScreen)});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();
