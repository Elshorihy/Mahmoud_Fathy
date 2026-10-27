import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://dmrkfisymvlilrqkfpbv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YRw_2rDphDB1gonCs' + 'Emu4Q_MleTjhqJ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = (id) => document.getElementById(id);
const defaults = {
  site_name: 'الشيخ محمود فتحي', subtitle: 'المكتبة الدعوية',
  hero_title: 'كلمة طيبة، وأثرٌ يبقى.',
  hero_description: 'مساحة تجمع محاضرات وكلمات الشيخ محمود فتحي، لتصل إلى الكلمة النافعة بسهولة وفي مكان واحد.',
  telegram_url: 'https://t.me/mahmoud_fathy_ahmed', accent_color: '#d8bb7e',
  background_color: '#071b18', logo_url: ''
};
let settings = { ...defaults }, items = [], currentUser = null, isAdmin = false;

function esc(s='') { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function typeOf(i) {
  if (i.content_type) return i.content_type;
  const u=i.url||'';
  if (/youtu\.be|youtube\.com/i.test(u)) return 'youtube';
  if (/\.(mp3|m4a|aac|ogg|wav)(\?|$)/i.test(u)) return 'audio';
  if (/\.(mp4|webm|mov|m3u8)(\?|$)/i.test(u)) return 'video';
  return 'telegram';
}
function label(i) { return ({telegram:'من تليجرام',youtube:'يوتيوب',audio:'تسجيل صوتي',video:'فيديو'})[typeOf(i)] || 'محتوى'; }
function tgEmbed(u) {
  try { const x=new URL(u), p=x.pathname.split('/').filter(Boolean); return x.hostname.endsWith('t.me')&&p.length>=2 ? 'https://t.me/'+p[0]+'/'+p[1]+'?embed=1' : null; } catch { return null; }
}
function ytId(u) {
  try { const x=new URL(u); if(x.hostname.includes('youtu.be')) return x.pathname.split('/').filter(Boolean)[0]; if(x.searchParams.get('v')) return x.searchParams.get('v'); const m=x.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/); return m?m[2]:null; } catch { return null; }
}
function player(i) {
  let u; try { u=new URL(i.url); if(!['https:','http:'].includes(u.protocol)) throw 0; } catch { return '<p>الرابط غير صالح.</p>'; }
  const t=typeOf(i);
  if(t==='youtube') { const id=ytId(u.href); return id?'<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'" title="فيديو يوتيوب" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe><a target="_blank" rel="noopener" href="'+u.href+'">فتح الفيديو الأصلي ↗</a></div>':'<p>رابط يوتيوب غير معروف.</p>'; }
  if(t==='audio') return '<div class="player"><audio controls preload="metadata" src="'+u.href+'"></audio><p>يلزم رابط ملف صوت مباشر يسمح بالتشغيل من المتصفح.</p><a target="_blank" rel="noopener" href="'+u.href+'">فتح مصدر الصوت ↗</a></div>';
  if(t==='video') return '<div class="player"><video controls playsinline preload="metadata" src="'+u.href+'"></video><p>يلزم رابط ملف فيديو مباشر يسمح بالتشغيل من المتصفح.</p><a target="_blank" rel="noopener" href="'+u.href+'">فتح ملف الفيديو ↗</a></div>';
  const e=tgEmbed(u.href);
  return e?'<div class="player"><iframe class="tg" src="'+e+'" title="منشور تليجرام" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe><p>تضمين تليجرام لا يضمن تشغيل كل ملفات الوسائط داخل الموقع. لو لم يعمل، افتح المنشور الأصلي.</p><a class="btn primary" target="_blank" rel="noopener" href="'+u.href+'">فتح المنشور على تليجرام ↗</a></div>':'<div class="player"><p>المصدر لا يدعم مشغلًا مضمّنًا معروفًا.</p><a target="_blank" rel="noopener" href="'+u.href+'">فتح المصدر ↗</a></div>';
}
function applySettings() {
  document.title=settings.site_name+' | '+settings.subtitle;
  $('brandName').textContent=settings.site_name; $('brandSubtitle').textContent=settings.subtitle;
  $('heroTitle').textContent=settings.hero_title; $('heroDescription').textContent=settings.hero_description;
  document.querySelectorAll('a[href="https://t.me/mahmoud_fathy_ahmed"]').forEach(a=>a.href=settings.telegram_url);
  document.documentElement.style.setProperty('--gold',settings.accent_color);
  document.documentElement.style.setProperty('--bg',settings.background_color);
  $('themeMeta').content=settings.background_color;
  const logo=settings.logo_url ? '<img alt="شعار الموقع" src="'+esc(settings.logo_url)+'" style="width:100%;height:100%;object-fit:contain;border-radius:inherit">' : 'م';
  $('brandMark').innerHTML=logo;
  document.querySelectorAll('footer .brand .mark').forEach(el=>el.innerHTML=logo);
}
function render() {
  const q=$('search').value.trim().toLowerCase(), f=$('filter').value;
  const list=items.filter(i=>i.is_published!==false && (!q||((i.title+' '+(i.description||'')).toLowerCase().includes(q))) && (f==='all'||typeOf(i)===f));
  $('count').textContent=String(items.length).padStart(2,'0'); $('empty').hidden=!!list.length;
  $('grid').innerHTML=list.map(i=>'<article class="card"><div class="cover"><span class="tag">'+esc(label(i))+'</span><span class="play">▶</span></div><div class="body"><h3>'+esc(i.title)+'</h3><p>'+esc(i.description||'محتوى من مكتبة الشيخ محمود فتحي.')+'</p><div class="cardfoot"><span>مكتبة الشيخ</span><button class="textbtn" data-play="'+esc(i.id)+'">تشغيل / عرض ↗</button></div></div><div id="player-'+esc(i.id)+'" hidden></div></article>').join('');
  document.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>{const el=$('player-'+b.dataset.play), it=items.find(x=>x.id===b.dataset.play); if(!el||!it)return; if(el.hidden){el.hidden=false;el.innerHTML=player(it);b.textContent='إخفاء المشغل ↑';}else{el.hidden=true;el.innerHTML='';b.textContent='تشغيل / عرض ↗';}});
}
async function loadPublicData() {
  const [s, r] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id',true).maybeSingle(),
    supabase.from('library_items').select('*').eq('is_published',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false})
  ]);
  if(s.error) console.error('Settings:',s.error.message); else if(s.data) settings={...defaults,...s.data};
  if(r.error) { console.error('Library:',r.error.message); showNotice('تعذر تحميل محتوى المكتبة من قاعدة البيانات.'); }
  else items=r.data||[];
  applySettings(); render();
}
function showNotice(message) {
  let el=$('dbNotice');
  if(!el){el=document.createElement('div');el.id='dbNotice';el.style.cssText='max-width:1100px;margin:10px auto;padding:10px 18px;color:#ead5a7;font-size:12px';document.querySelector('main').prepend(el);}
  el.textContent=message;
}
function modalOpen() { $('modal').classList.add('open'); renderAdminModal(); }
function renderAdminModal() {
  const dialog=document.querySelector('#modal .dialog');
  if(!currentUser) {
    dialog.innerHTML='<button class="close" id="close">×</button><div class="eyebrow">دخول آمن</div><h2>إدارة المكتبة</h2><p class="muted">الدخول متاح لحسابات الإدارة المعتمدة فقط.</p><form class="form" id="loginForm"><label>البريد الإلكتروني<input id="loginEmail" type="email" autocomplete="username" required></label><label>كلمة المرور<input id="loginPassword" type="password" autocomplete="current-password" required></label><button class="btn primary" type="submit">تسجيل الدخول</button><p id="authMessage" class="muted" role="status"></p></form>';
    $('close').onclick=()=> $('modal').classList.remove('open');
    $('loginForm').onsubmit=async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;$('authMessage').textContent='جارٍ التحقق…';const {error}=await supabase.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});b.disabled=false;if(error){$('authMessage').textContent='تعذر تسجيل الدخول. راجع البريد وكلمة المرور.';return;}await checkAdmin();renderAdminModal();};
    return;
  }
  if(!isAdmin) {
    dialog.innerHTML='<button class="close" id="close">×</button><div class="eyebrow">حساب غير معتمد</div><h2>مفيش صلاحية إدارة للحساب ده</h2><p class="muted">تم تسجيل الدخول، لكن الحساب مش مضاف لقائمة مديري الموقع. تواصل مع مالك المشروع لإضافته.</p><button class="btn" id="logout">تسجيل الخروج</button>';
    $('close').onclick=()=> $('modal').classList.remove('open'); $('logout').onclick=async()=>{await supabase.auth.signOut();currentUser=null;isAdmin=false;renderAdminModal();}; return;
  }
  dialog.innerHTML='<button class="close" id="close">×</button><div class="eyebrow">إدارة المكتبة والموقع</div><h2>لوحة التحكم</h2><p class="muted">متصل بقاعدة البيانات — '+esc(currentUser.email||'')+'</p><details open><summary style="cursor:pointer;color:var(--gold);padding:10px 0">إضافة محتوى</summary><form class="form" id="addForm"><label>عنوان المحتوى<input id="itemTitle" required maxlength="120"></label><label>رابط المنشور أو الوسائط<input id="itemUrl" type="url" required placeholder="https://t.me/... أو https://youtu.be/..."></label><label>نوع المحتوى<select id="itemType"><option value="telegram">منشور تليجرام</option><option value="youtube">فيديو يوتيوب</option><option value="audio">تسجيل صوتي مباشر</option><option value="video">فيديو مباشر</option></select></label><label>وصف مختصر<textarea id="itemDesc" rows="2" maxlength="300"></textarea></label><button class="btn primary" type="submit">إضافة للمكتبة ＋</button><p id="addMessage" class="muted"></p></form></details><details open><summary style="cursor:pointer;color:var(--gold);padding:14px 0">إعدادات الهوية</summary><form class="form" id="settingsForm"><label>اسم الموقع<input id="setName" maxlength="80" required></label><label>الوصف تحت الاسم<input id="setSubtitle" maxlength="100" required></label><label>العنوان الرئيسي<input id="setHero" maxlength="160" required></label><label>وصف الصفحة الرئيسية<textarea id="setDescription" rows="2" maxlength="400" required></textarea></label><label>رابط قناة تليجرام<input id="setTelegram" type="url" required></label><label>رابط صورة الشعار<input id="setLogo" type="url" placeholder="رابط عام للصورة (اختياري)"></label><label>لون التمييز<input id="setGold" type="color" style="height:45px"></label><label>لون الخلفية<input id="setBg" type="color" style="height:45px"></label><button class="btn primary" type="submit">حفظ الإعدادات</button><p id="settingsMessage" class="muted"></p></form></details><details><summary style="cursor:pointer;color:var(--gold);padding:14px 0">إدارة المحتوى الموجود</summary><div class="admin-list" id="adminItems"></div></details><button class="btn" id="logout" style="margin-top:18px">تسجيل الخروج</button>';
  $('close').onclick=()=> $('modal').classList.remove('open');
  $('setName').value=settings.site_name;$('setSubtitle').value=settings.subtitle;$('setHero').value=settings.hero_title;$('setDescription').value=settings.hero_description;$('setTelegram').value=settings.telegram_url;$('setLogo').value=settings.logo_url||'';$('setGold').value=settings.accent_color;$('setBg').value=settings.background_color;
  $('settingsForm').onsubmit=async e=>{e.preventDefault();const msg=$('settingsMessage');msg.textContent='جارٍ الحفظ…';const row={id:true,site_name:$('setName').value.trim(),subtitle:$('setSubtitle').value.trim(),hero_title:$('setHero').value.trim(),hero_description:$('setDescription').value.trim(),telegram_url:$('setTelegram').value.trim(),logo_url:$('setLogo').value.trim()||null,accent_color:$('setGold').value,background_color:$('setBg').value,updated_at:new Date().toISOString(),updated_by:currentUser.id};const {error}=await supabase.from('site_settings').upsert(row,{onConflict:'id'});if(error){msg.textContent='فشل الحفظ: '+error.message;return;}settings={...defaults,...row};applySettings();msg.textContent='اتحفظت الإعدادات وظهرت لكل الزوار.';};
  $('addForm').onsubmit=async e=>{e.preventDefault();const msg=$('addMessage');msg.textContent='جارٍ الإضافة…';const url=$('itemUrl').value.trim();let parsed;try{parsed=new URL(url);if(!['https:','http:'].includes(parsed.protocol))throw 0;}catch{msg.textContent='اكتب رابط HTTPS صحيح.';return;}const row={title:$('itemTitle').value.trim(),url,content_type:$('itemType').value,description:$('itemDesc').value.trim(),created_by:currentUser.id};const {error}=await supabase.from('library_items').insert(row);if(error){msg.textContent='فشلت الإضافة: '+error.message;return;}msg.textContent='تمت الإضافة بنجاح.';e.target.reset();await loadPublicData();renderAdminItems();};
  $('logout').onclick=async()=>{await supabase.auth.signOut();currentUser=null;isAdmin=false;renderAdminModal();};
  renderAdminItems();
}
async function renderAdminItems() {
  const host=$('adminItems');if(!host||!isAdmin)return;
  const {data,error}=await supabase.from('library_items').select('*').order('created_at',{ascending:false});
  if(error){host.textContent='تعذر تحميل المحتوى.';return;}
  host.innerHTML=(data||[]).map(i=>'<div class="admin-row"><span>'+esc(i.title)+' <small>('+esc(label(i))+')</small></span><button data-del="'+esc(i.id)+'" style="border:0;background:none;color:#e8a29b;cursor:pointer">حذف</button></div>').join('')||'<p class="muted">لا يوجد محتوى.</p>';
  host.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{if(!confirm('متأكد إنك عاوز تحذف المحتوى ده؟'))return;const {error}=await supabase.from('library_items').delete().eq('id',b.dataset.del);if(error){alert('فشل الحذف: '+error.message);return;}await loadPublicData();renderAdminItems();});
}
async function checkAdmin() {
  const {data:{user}}=await supabase.auth.getUser();currentUser=user;
  if(!user){isAdmin=false;return;}
  const {data,error}=await supabase.from('site_admins').select('role').eq('user_id',user.id).maybeSingle();
  isAdmin=!!data&&!error;
}
$('search').oninput=render;$('filter').onchange=render;
$('adminOpen').onclick=modalOpen;$('close').onclick=()=> $('modal').classList.remove('open');
$('modal').onclick=e=>{if(e.target===$('modal'))$('modal').classList.remove('open');};
document.onkeydown=e=>{if(e.key==='Escape')$('modal').classList.remove('open');};
supabase.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;if(!currentUser)isAdmin=false;});
await loadPublicData();
await checkAdmin();
