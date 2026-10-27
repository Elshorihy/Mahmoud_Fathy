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
$('search').oninput=render;$('filter').onchange=render;
await loadPublicData();
