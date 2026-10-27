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
  const raw=String(i.url||'').trim();
  let u; try { u=new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)?raw:'https://'+raw); } catch {}
  const host=u?.hostname.toLowerCase().replace(/^www\./,'')||'';
  if (['youtube.com','m.youtube.com','music.youtube.com','youtu.be','youtube-nocookie.com'].includes(host)) return 'youtube';
  const path=u?.pathname||raw.split(/[?#]/)[0];
  if (/\.(mp3|m4a|aac|ogg|wav|flac|opus)$/i.test(path)) return 'audio';
  if (/\.(mp4|webm|mov|m3u8|ogv|m4v)$/i.test(path)) return 'video';
  if (i.content_type && ['audio','video','youtube','telegram'].includes(String(i.content_type).toLowerCase())) return String(i.content_type).toLowerCase();
  return 'telegram';
}
function safeTelegramUrl(raw) {
  try {
    const u = new URL(String(raw || ''));
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    return u.protocol === 'https:' && ['t.me', 'telegram.me'].includes(host)
      ? u.href
      : defaults.telegram_url;
  } catch {
    return defaults.telegram_url;
  }
}
function safeLogoUrl(raw) {
  try {
    const u = new URL(String(raw || ''));
    return u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
}
function label(i) { return ({telegram:'من تليجرام',youtube:'يوتيوب',audio:'تسجيل صوتي',video:'فيديو'})[typeOf(i)] || 'محتوى'; }
function tgEmbed(u) {
  try { const x=new URL(u), p=x.pathname.split('/').filter(Boolean); return x.hostname.endsWith('t.me')&&p.length>=2 ? 'https://t.me/'+p[0]+'/'+p[1]+'?embed=1' : null; } catch { return null; }
}
function ytId(raw) {
  const value=String(raw ?? '').normalize('NFKC').trim();
  if (!value) return null;
  const candidates=[];
  try {
    const normalized=/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : 'https://' + value;
    const u=new URL(normalized);
    const host=u.hostname.toLowerCase().replace(/^www\./,'');
    if (host==='youtu.be') candidates.push(u.pathname.split('/').filter(Boolean)[0] || '');
    if (['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com'].includes(host)) {
      candidates.push(u.searchParams.get('v') || '');
      const parts=u.pathname.split('/').filter(Boolean);
      const marker=parts.findIndex(part=>['embed','shorts','live','v'].includes(part.toLowerCase()));
      if (marker>=0) candidates.push(parts[marker+1] || '');
    }
  } catch {}
  const compact=value.replaceAll(' ','');
  const shortAt=compact.toLowerCase().indexOf('youtu.be/');
  if (shortAt>=0) candidates.push(compact.slice(shortAt+9).split(/[?&#/]/)[0]);
  for (const candidate of candidates) {
    const id=String(candidate || '').split(/[?&#/]/)[0];
    if (new RegExp('^[A-Za-z0-9_-]{11}$').test(id)) return id;
  }
  return null;
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
  const telegramUrl=safeTelegramUrl(settings.telegram_url);document.querySelectorAll('a[href="https://t.me/mahmoud_fathy_ahmed"]').forEach(a=>a.href=telegramUrl);
  document.documentElement.style.setProperty('--gold',settings.accent_color);
  document.documentElement.style.setProperty('--bg',settings.background_color);
  $('themeMeta').content=settings.background_color;
  const logoUrl=safeLogoUrl(settings.logo_url);const logo=logoUrl ? '<img alt="شعار الموقع" src="'+esc(logoUrl)+'" style="width:100%;height:100%;object-fit:contain;border-radius:inherit">' : 'م';
  $('brandMark').innerHTML=logo;
  document.querySelectorAll('footer .brand .mark').forEach(el=>el.innerHTML=logo);
}
const favKey='mahmoud-fathy-favorites';const recentKey='mahmoud-fathy-recent';function readLocal(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return []}}function writeLocal(key,v){try{localStorage.setItem(key,JSON.stringify(v))}catch{}}
function render() {
  const q=$('search').value.trim().toLowerCase(), f=$('filter').value;
  const favorites=readLocal(favKey).map(String);
  const list=items.filter(i=>{
    if(i.is_published===false) return false;
    if(q&&!((String(i.title||'')+' '+String(i.description||'')).toLowerCase().includes(q))) return false;
    if(f==='favorites') return favorites.includes(String(i.id));
    return f==='all'||typeOf(i)===f;
  });
  $('count').textContent=String(items.length).padStart(2,'0');
  $('empty').hidden=!!list.length;
  $('empty').textContent=f==='favorites'?'لسه مفيش محتوى في المفضلة. اضغط ☆ على أي بطاقة لحفظها.':'مفيش نتائج مطابقة. جرّب كلمة تانية.';
  $('grid').innerHTML=list.map(i=>{
    const id=String(i.id), favorite=favorites.includes(id);
    return '<article class="card" id="item-'+esc(id)+'"><div class="cover"><span class="tag">'+esc(label(i))+'</span><span class="play" aria-hidden="true">▶</span></div><div class="body"><h3>'+esc(i.title)+'</h3><p>'+esc(i.description||'محتوى من مكتبة الشيخ محمود فتحي.')+'</p><div class="cardfoot"><span>'+esc(label(i))+'</span><button class="textbtn" data-play="'+esc(id)+'" aria-expanded="false">تشغيل / عرض ↗</button></div><div class="card-actions"><button class="textbtn" data-fav="'+esc(id)+'" aria-pressed="'+String(favorite)+'" title="'+(favorite?'إزالة من المفضلة':'إضافة إلى المفضلة')+'">'+(favorite?'★ المفضلة':'☆ المفضلة')+'</button><button class="textbtn" data-share="'+esc(id)+'">مشاركة ↗</button></div></div><div id="player-'+esc(id)+'" hidden></div></article>';
  }).join('');
  document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.fav;let a=readLocal(favKey).map(String);
    a=a.includes(id)?a.filter(x=>x!==id):[...a,id];writeLocal(favKey,a);
    if($('filter').value==='favorites') render();
    else {const active=a.includes(id);b.textContent=active?'★ المفضلة':'☆ المفضلة';b.setAttribute('aria-pressed',String(active));b.title=active?'إزالة من المفضلة':'إضافة إلى المفضلة';}
  });
  document.querySelectorAll('[data-share]').forEach(b=>b.onclick=async()=>{
    const i=items.find(x=>String(x.id)===b.dataset.share);if(!i)return;
    const url=location.origin+location.pathname+'#item-'+encodeURIComponent(String(i.id));
    try {
      if(navigator.share) await navigator.share({title:i.title,text:i.description||'من مكتبة الشيخ محمود فتحي',url});
      else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);showNotice('تم نسخ رابط المحتوى للمشاركة.');}
      else {window.prompt('انسخ رابط المحتوى:',url);}
    } catch(e){if(e?.name!=='AbortError')window.prompt('انسخ رابط المحتوى:',url);}
  });
  document.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>{
    const el=$('player-'+b.dataset.play),it=items.find(x=>String(x.id)===b.dataset.play);if(!el||!it)return;
    if(el.hidden){el.hidden=false;el.innerHTML=player(it);b.textContent='إخفاء المشغل ↑';b.setAttribute('aria-expanded','true');let recent=readLocal(recentKey).filter(x=>String(x)!==String(it.id));writeLocal(recentKey,[it.id,...recent].slice(0,10));}
    else {el.hidden=true;el.replaceChildren();b.textContent='تشغيل / عرض ↗';b.setAttribute('aria-expanded','false');}
  });
  if(location.hash.startsWith('#item-')){
    const id=decodeURIComponent(location.hash.slice(6));
    requestAnimationFrame(()=>document.getElementById('item-'+id)?.scrollIntoView({block:'start',behavior:'smooth'}));
  }
}
async function loadPublicData() {
  showNotice('جارٍ تحميل محتوى المكتبة…');
  const [s, r] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id',true).maybeSingle(),
    supabase.from('library_items').select('*').eq('is_published',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false})
  ]);
  if(s.error) console.error('Settings:',s.error.message); else if(s.data) settings={...defaults,...s.data};
  if(r.error) { console.error('Library:',r.error.message); showNotice('تعذر تحميل محتوى المكتبة. تحقق من الاتصال ثم أعد تحميل الصفحة.'); }
  else items=r.data||[];
  applySettings(); render();
  if(!r.error) $('dbNotice')?.remove();
}
function showNotice(message) {
  let el=$('dbNotice');
  if(!el){el=document.createElement('div');el.id='dbNotice';el.style.cssText='max-width:1100px;margin:10px auto;padding:10px 18px;color:#ead5a7;font-size:12px';document.querySelector('main').prepend(el);}
  el.textContent=message;
}
$('search').oninput=render;$('filter').onchange=render;
const menuToggle=$('menuToggle'),siteNav=$('siteNav');
if(menuToggle&&siteNav){
  menuToggle.addEventListener('click',()=>{
    const open=siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded',String(open));
    menuToggle.setAttribute('aria-label',open?'إغلاق قائمة التنقل':'فتح قائمة التنقل');
  });
  siteNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    siteNav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');
  }));
}
await loadPublicData();
