const API='../php/api',V2=API+'/admin.php';
let D={students:[],classes:[],registrations:[],payments:[],gallery:[],testimonials:[],contacts:[],locations:[],users:[],announcements:[],banners:[]};
let pendingFn=null,charts={};
const NAV=[
{id:'dashboard',icon:'bi-grid-1x2-fill',label:'Dashboard'},
{id:'students',icon:'bi-people-fill',label:'Data Siswa'},
{id:'classes',icon:'bi-book-fill',label:'Kelas & Program'},
{id:'registrations',icon:'bi-clipboard2-check-fill',label:'Registrasi'},
{id:'payments',icon:'bi-wallet2',label:'Keuangan'},
{id:'apriori',icon:'bi-diagram-3-fill',label:'Rekomendasi Apriori'},
{id:'reports',icon:'bi-file-earmark-bar-graph-fill',label:'Laporan'},
{id:'users',icon:'bi-person-gear',label:'Manajemen User'},
{t:'CMS & Konten'},
{id:'banners',icon:'bi-images',label:'Banner & Promo'},
{id:'announcements',icon:'bi-megaphone-fill',label:'Pengumuman'},
{id:'gallery',icon:'bi-camera-fill',label:'Galeri Kegiatan'},
{id:'testimonials',icon:'bi-chat-heart-fill',label:'Testimoni Orang Tua'},
{id:'locations',icon:'bi-geo-alt-fill',label:'Lokasi Sanggar'},
{id:'contacts',icon:'bi-envelope-fill',label:'Kontak Masuk'},
{t:'Lainnya'},
{id:'_website',icon:'bi-globe2',label:'Lihat Website',href:'../templates/index.html'},
{id:'_logout',icon:'bi-box-arrow-left',label:'Keluar'}
];
document.addEventListener('DOMContentLoaded',()=>{checkAuth();buildNav();showPage('dashboard');loadAllData()});
function checkAuth(){if(sessionStorage.getItem('admin_logged_in')!=='true'){fetch(API+'/check_auth.php',{credentials:'include'}).then(r=>r.json()).then(d=>{if(!d.logged_in)location.href='./index.html'}).catch(()=>location.href='./index.html')}document.getElementById('sidebarUsername').textContent=sessionStorage.getItem('admin_username')||'Admin'}
function buildNav(){const n=document.getElementById('sidebarNav');n.innerHTML=NAV.map(x=>{if(x.t)return`<div class="nav-section-label">${x.t}</div>`;if(x.href)return`<div class="nav-item"><a class="nav-link" href="${x.href}"><i class="bi ${x.icon}"></i><span>${x.label}</span></a></div>`;if(x.id==='_logout')return`<div class="nav-item"><a class="nav-link" onclick="doLogout()"><i class="bi ${x.icon}"></i><span>${x.label}</span></a></div>`;return`<div class="nav-item"><a class="nav-link" data-page="${x.id}" onclick="showPage('${x.id}')"><i class="bi ${x.icon}"></i><span>${x.label}</span></a></div>`}).join('')}
function showPage(p){document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));const l=document.querySelector(`[data-page="${p}"]`);if(l)l.classList.add('active');document.getElementById('pageTitle').textContent=l?l.querySelector('span').textContent:'Dashboard';document.getElementById('breadcrumb').textContent=p;const c=document.getElementById('contentArea');if(PAGES[p])c.innerHTML=PAGES[p]();else c.innerHTML='<div class="empty-state"><i class="bi bi-gear"></i><p>Halaman belum tersedia</p></div>';if(INIT[p])INIT[p]();if(innerWidth<768)toggleSidebar(false)}
function toggleSidebar(f){const s=document.getElementById('sidebar'),o=document.getElementById('mobileOverlay');const v=f!==undefined?f:!s.classList.contains('mobile-open');s.classList.toggle('mobile-open',v);o.classList.toggle('active',v)}
function doLogout(){fetch(API+'/logout.php',{credentials:'include'}).catch(()=>{});sessionStorage.clear();location.href='./index.html'}
async function loadAllData(){try{const[s,c,r]=await Promise.all([fetch(API+'/students.php').then(r=>r.json()),fetch(API+'/classes.php').then(r=>r.json()),fetch(API+'/registrations.php').then(r=>r.json())]);D.students=Array.isArray(s)?s:[];D.classes=Array.isArray(c)?c:[];D.registrations=Array.isArray(r)?r:[];try{const p=await fetch(V2+'?module=payments').then(r=>r.json());D.payments=p.data||[]}catch(e){D.payments=[]}try{const g=await fetch(V2+'?module=gallery').then(r=>r.json());D.gallery=g.data||[]}catch(e){}try{const t=await fetch(V2+'?module=testimonials').then(r=>r.json());D.testimonials=t.data||[]}catch(e){}try{const ct=await fetch(V2+'?module=contacts').then(r=>r.json());D.contacts=ct.data||[];const u=D.contacts.filter(x=>x.status==='unread').length;document.getElementById('notifDot').style.display=u>0?'':'none'}catch(e){}try{const loc=await fetch(V2+'?module=locations').then(r=>r.json());D.locations=loc.data||[]}catch(e){}try{const u=await fetch(V2+'?module=users').then(r=>r.json());D.users=u.data||[]}catch(e){}try{const b=await fetch(API+'/cms.php?type=banners&all=1').then(r=>r.json());D.banners=b.data||[]}catch(e){}try{const a=await fetch(API+'/cms.php?type=announcements&all=1').then(r=>r.json());D.announcements=a.data||[]}catch(e){}const pg=document.querySelector('.nav-link.active');if(pg){const pid=pg.dataset.page;if(pid&&INIT[pid])INIT[pid]()}}catch(e){console.error(e);toast('Gagal memuat data','error')}}
// === UTILS ===
function E(s){if(!s)return'';const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function enc(s){return encodeURIComponent(s||'')}
function fmtDate(d){if(!d)return'-';try{return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}catch(e){return d}}
function fmtMoney(n){return'Rp '+Number(n||0).toLocaleString('id-ID')}
function toast(m,t='success'){const c=document.getElementById('toastContainer'),d=document.createElement('div');d.className='toast '+t;d.innerHTML=`<i class="bi ${t==='success'?'bi-check-circle-fill':'bi-exclamation-circle-fill'}"></i><span>${m}</span>`;c.appendChild(d);setTimeout(()=>{d.style.opacity='0';setTimeout(()=>d.remove(),300)},3000)}
function openModal(html){document.getElementById('modalBox').innerHTML=html;document.getElementById('modalOverlay').classList.add('active')}
function closeModal(){document.getElementById('modalOverlay').classList.remove('active')}
function showConfirm(m,fn){document.getElementById('confirmMsg').textContent=m;pendingFn=fn;document.getElementById('confirmDialog').classList.add('active')}
function closeConfirm(){document.getElementById('confirmDialog').classList.remove('active');pendingFn=null}
function confirmAction(){if(pendingFn)pendingFn();closeConfirm()}
function animNum(id,val){const el=document.getElementById(id);if(!el)return;let c=0;const s=Math.max(1,Math.ceil(val/25));const i=setInterval(()=>{c=Math.min(c+s,val);el.textContent=c;if(c>=val)clearInterval(i)},30)}
