// BANNERS & PROMO Ã¢â‚¬â€ with drag-and-drop image upload
let bannerUploadedUrl='';
function handleBannerDragOver(e){e.preventDefault();e.stopPropagation();document.getElementById('bannerDropZone').classList.add('drag-over')}
function handleBannerDragLeave(e){e.preventDefault();e.stopPropagation();document.getElementById('bannerDropZone').classList.remove('drag-over')}
function handleBannerDrop(e){e.preventDefault();e.stopPropagation();document.getElementById('bannerDropZone').classList.remove('drag-over');if(e.dataTransfer.files.length>0)uploadBannerFile(e.dataTransfer.files[0])}
function handleBannerFileSelect(e){if(e.target.files.length>0)uploadBannerFile(e.target.files[0])}
async function uploadBannerFile(file){
if(!file.type.startsWith('image/')){toast('Hanya file gambar','error');return}
if(file.size>5*1024*1024){toast('Max 5MB','error');return}
const zone=document.getElementById('bannerDropZone'),content=document.getElementById('bannerDropContent'),progress=document.getElementById('bannerUploadProgress'),bar=document.getElementById('bannerProgressBar');
const reader=new FileReader();
reader.onload=(ev)=>{content.innerHTML=`<img src="${ev.target.result}" class="dropzone-preview"><div class="dropzone-uploading"><span class="spinner-sm"></span> Mengupload...</div>`;zone.classList.add('has-file')};
reader.readAsDataURL(file);
progress.style.display='block';bar.style.width='30%';
const fd=new FormData();fd.append('file',file);fd.append('category','banners');
try{bar.style.width='60%';const res=await fetch(API+'/upload.php',{method:'POST',body:fd});bar.style.width='90%';const data=await res.json();
if(data.success){bar.style.width='100%';bar.classList.add('done');bannerUploadedUrl=data.url;document.getElementById('fBimg').value=data.url;setTimeout(()=>{progress.style.display='none';bar.style.width='0';bar.classList.remove('done');const ch=document.querySelector('.dropzone-uploading');if(ch)ch.innerHTML='<i class="bi bi-check-circle-fill" style="color:var(--success)"></i> Upload berhasil'},500);toast('Gambar banner diupload')}
else{toast(data.message||'Upload gagal','error');progress.style.display='none';bar.style.width='0'}}
catch(err){toast('Upload gagal','error');progress.style.display='none';bar.style.width='0'}}
PAGES.banners=()=>`<div class="page-header"><h1>Banner & Promo</h1><p>Kelola banner dan promo website.</p></div><div class="panel"><div class="panel-header"><div class="panel-title"><i class="bi bi-images"></i> Banners</div><button class="btn btn-primary btn-sm" onclick="modalBanner()"><i class="bi bi-plus-lg"></i> Tambah</button></div><div class="table-wrapper"><table class="data-table"><thead><tr><th>Gambar</th><th>Judul</th><th>Subtitle</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="tblBanners"></tbody></table></div></div>`;
INIT.banners=()=>{document.getElementById('tblBanners').innerHTML=D.banners.map(b=>`<tr><td>${b.image_url?`<img src="${E(b.image_url)}" style="width:80px;height:50px;object-fit:cover;border-radius:8px;border:1px solid var(--border)" onerror="this.outerHTML='-'">`:'-'}</td><td><strong>${E(b.title)}</strong></td><td>${E(b.subtitle||'-')}</td><td><button class="btn btn-sm ${b.is_active==1?'btn-success':'btn-outline'}" onclick="toggleCms('banners',${b.id})">${b.is_active==1?'Aktif':'Nonaktif'}</button></td><td><div class="action-btns"><button class="btn btn-ghost btn-icon" onclick="modalBanner(${b.id})"><i class="bi bi-pencil"></i></button><button class="btn btn-ghost btn-icon" style="color:var(--danger)" onclick="delCms('banners',${b.id})"><i class="bi bi-trash3"></i></button></div></td></tr>`).join('')||'<tr><td colspan="5"><div class="empty-state"><p>Belum ada banner</p></div></td></tr>'};
function modalBanner(id){const b=id?D.banners.find(x=>x.id==id):null;bannerUploadedUrl=b?.image_url||'';openModal(`<div class="modal-header"><h3>${b?'Edit':'Tambah'} Banner</h3><button class="modal-close" onclick="closeModal()"><i class="bi bi-x-lg"></i></button></div><div class="modal-body"><form onsubmit="saveCms(event,'banners',${id||0})"><div class="form-group"><label class="form-label">Judul *</label><input class="form-control" id="fBtitle" value="${E(b?.title||'')}" required></div><div class="form-group"><label class="form-label">Subtitle</label><input class="form-control" id="fBsub" value="${E(b?.subtitle||'')}"></div><div class="form-group"><label class="form-label">Gambar Banner</label><div id="bannerDropZone" class="dropzone ${b?.image_url?'has-file':''}" ondrop="handleBannerDrop(event)" ondragover="handleBannerDragOver(event)" ondragleave="handleBannerDragLeave(event)" onclick="document.getElementById('bannerFileInput').click()"><input type="file" id="bannerFileInput" accept="image/*" style="display:none" onchange="handleBannerFileSelect(event)"><div id="bannerDropContent">${b?.image_url?`<img src="${E(b.image_url)}" class="dropzone-preview"><div class="dropzone-change"><i class="bi bi-pencil-fill"></i> Ganti Gambar</div>`:`<div class="dropzone-empty"><i class="bi bi-cloud-arrow-up-fill"></i><p><strong>Drag & Drop</strong> gambar ke sini</p><p class="dropzone-hint">atau klik untuk pilih file Ã¢â‚¬Â¢ JPG, PNG, WebP Ã¢â‚¬Â¢ Max 5MB</p></div>`}</div><div id="bannerUploadProgress" class="upload-progress" style="display:none"><div class="upload-progress-bar" id="bannerProgressBar"></div></div></div><input type="hidden" id="fBimg" value="${E(b?.image_url||'')}"></div><div class="form-group"><label class="form-label">Link URL</label><input class="form-control" id="fBlink" value="${E(b?.link_url||'')}"></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div></form></div>`)}
// ANNOUNCEMENTS
PAGES.announcements=()=>`<div class="page-header"><h1>Pengumuman</h1><p>Kelola pengumuman dan berita.</p></div><div class="panel"><div class="panel-header"><div class="panel-title"><i class="bi bi-megaphone-fill"></i> Pengumuman</div><button class="btn btn-primary btn-sm" onclick="modalAnnounce()"><i class="bi bi-plus-lg"></i> Tambah</button></div><div class="table-wrapper"><table class="data-table"><thead><tr><th>Judul</th><th>Tipe</th><th>Status</th><th>Dibuat</th><th>Aksi</th></tr></thead><tbody id="tblAnnounce"></tbody></table></div></div>`;
INIT.announcements=()=>{document.getElementById('tblAnnounce').innerHTML=D.announcements.map(a=>`<tr><td><strong>${E(a.title)}</strong><br><small style="color:var(--text-muted)">${E((a.message||'').slice(0,60))}...</small></td><td><span class="badge ${a.type==='warning'?'badge-warning':a.type==='success'?'badge-success':'badge-info'}">${a.type}</span></td><td><button class="btn btn-sm ${a.is_active==1?'btn-success':'btn-outline'}" onclick="toggleCms('announcements',${a.id})">${a.is_active==1?'Aktif':'Nonaktif'}</button></td><td>${fmtDate(a.created_at)}</td><td><div class="action-btns"><button class="btn btn-ghost btn-icon" onclick="modalAnnounce(${a.id})"><i class="bi bi-pencil"></i></button><button class="btn btn-ghost btn-icon" style="color:var(--danger)" onclick="delCms('announcements',${a.id})"><i class="bi bi-trash3"></i></button></div></td></tr>`).join('')||'<tr><td colspan="5"><div class="empty-state"><p>Belum ada</p></div></td></tr>'};
function modalAnnounce(id){const a=id?D.announcements.find(x=>x.id==id):null;openModal(`<div class="modal-header"><h3>${a?'Edit':'Tambah'} Pengumuman</h3><button class="modal-close" onclick="closeModal()"><i class="bi bi-x-lg"></i></button></div><div class="modal-body"><form onsubmit="saveCmsAnnounce(event,${id||0})"><div class="form-group"><label class="form-label">Judul *</label><input class="form-control" id="fAtitle" value="${E(a?.title||'')}" required></div><div class="form-group"><label class="form-label">Pesan *</label><textarea class="form-control" id="fAmsg" required>${E(a?.message||'')}</textarea></div><div class="form-group"><label class="form-label">Tipe</label><select class="form-control" id="fAtype"><option ${a?.type==='info'?'selected':''}>info</option><option ${a?.type==='warning'?'selected':''}>warning</option><option ${a?.type==='success'?'selected':''}>success</option></select></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div></form></div>`)}
async function saveCmsAnnounce(e,id){e.preventDefault();const b={title:g('fAtitle'),message:g('fAmsg'),type:g('fAtype')};try{const u=id?`${API}/cms.php?type=announcements&id=${id}`:API+'/cms.php?type=announcements';await fetch(u,{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});toast('Tersimpan');closeModal();await loadAllData();showPage('announcements')}catch(e){toast('Error','error')}}

// GALLERY
PAGES.gallery=()=>`<div class="page-header"><h1>Galeri Kegiatan</h1><p>Kelola foto kegiatan sanggar.</p></div><div class="panel"><div class="panel-header"><div class="panel-title"><i class="bi bi-camera-fill"></i> Galeri</div><button class="btn btn-primary btn-sm" onclick="modalGallery()"><i class="bi bi-plus-lg"></i> Tambah</button></div><div class="panel-body"><div id="galleryGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px"></div></div></div>`;
INIT.gallery=()=>{document.getElementById('galleryGrid').innerHTML=D.gallery.length?D.gallery.map(gi=>`<div style="background:#fff;border-radius:14px;border:1px solid var(--border);overflow:hidden;transition:all .25s" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.transform='';this.style.boxShadow=''"><div style="height:160px;background:var(--bg-subtle);display:flex;align-items:center;justify-content:center;overflow:hidden">${gi.image_url?`<img src="${E(gi.image_url)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\\'bi bi-image\\' style=\\'font-size:2rem;color:var(--text-light)\\'></i>'">`:'<i class="bi bi-image" style="font-size:2rem;color:var(--text-light)"></i>'}</div><div style="padding:14px"><strong style="font-size:.88rem;display:block;margin-bottom:2px">${E(gi.title)}</strong><small style="color:var(--text-muted)">${E(gi.category||'Kegiatan')}</small><div style="margin-top:10px;display:flex;gap:4px"><button class="btn btn-ghost btn-icon btn-sm" onclick="modalGallery(${gi.id})"><i class="bi bi-pencil"></i></button><button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" onclick="delV2('gallery',${gi.id})"><i class="bi bi-trash3"></i></button></div></div></div>`).join(''):'<div class="empty-state" style="grid-column:1/-1"><i class="bi bi-camera"></i><p>Belum ada foto. Klik tombol Tambah untuk upload.</p></div>'};

let galleryUploadedUrl='';
function modalGallery(id){
const g2=id?D.gallery.find(x=>x.id==id):null;
galleryUploadedUrl=g2?.image_url||'';
openModal(`<div class="modal-header"><h3>${g2?'Edit':'Tambah'} Foto</h3><button class="modal-close" onclick="closeModal()"><i class="bi bi-x-lg"></i></button></div>
<div class="modal-body"><form id="galleryForm" onsubmit="saveGallery(event,${id||0})">
<div class="form-group"><label class="form-label">Judul *</label><input class="form-control" id="f_title" value="${E(g2?.title||'')}" required></div>
<div class="form-group"><label class="form-label">Gambar *</label>
<div id="dropZone" class="dropzone ${g2?.image_url?'has-file':''}" ondrop="handleDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" onclick="document.getElementById('fileInput').click()">
<input type="file" id="fileInput" accept="image/*" style="display:none" onchange="handleFileSelect(event)">
<div id="dropContent">
${g2?.image_url?`<img src="${E(g2.image_url)}" id="previewImg" class="dropzone-preview"><div class="dropzone-change"><i class="bi bi-pencil-fill"></i> Ganti Gambar</div>`:`<div class="dropzone-empty"><i class="bi bi-cloud-arrow-up-fill"></i><p><strong>Drag & Drop</strong> gambar ke sini</p><p class="dropzone-hint">atau klik untuk pilih file Ã¢â‚¬Â¢ JPG, PNG, GIF, WebP Ã¢â‚¬Â¢ Max 5MB</p></div>`}
</div>
<div id="uploadProgress" class="upload-progress" style="display:none"><div class="upload-progress-bar" id="progressBar"></div></div>
</div>
<input type="hidden" id="f_image_url" value="${E(g2?.image_url||'')}">
</div>
<div class="form-row"><div class="form-group"><label class="form-label">Kategori</label><input class="form-control" id="f_category" value="${E(g2?.category||'Kegiatan')}"></div></div>
<div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-control" id="f_description">${E(g2?.description||'')}</textarea></div>
<div class="modal-footer"><button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary" id="btnSaveGallery"><i class="bi bi-check-lg"></i> Simpan</button></div>
</form></div>`)}

function handleDragOver(e){e.preventDefault();e.stopPropagation();document.getElementById('dropZone').classList.add('drag-over')}
function handleDragLeave(e){e.preventDefault();e.stopPropagation();document.getElementById('dropZone').classList.remove('drag-over')}
function handleDrop(e){e.preventDefault();e.stopPropagation();document.getElementById('dropZone').classList.remove('drag-over');const files=e.dataTransfer.files;if(files.length>0)uploadFile(files[0])}
function handleFileSelect(e){const files=e.target.files;if(files.length>0)uploadFile(files[0])}

async function uploadFile(file){
if(!file.type.startsWith('image/')){toast('Hanya file gambar yang diizinkan','error');return}
if(file.size>5*1024*1024){toast('Ukuran file maksimal 5MB','error');return}
const zone=document.getElementById('dropZone');
const content=document.getElementById('dropContent');
const progress=document.getElementById('uploadProgress');
const bar=document.getElementById('progressBar');
// Show preview immediately
const reader=new FileReader();
reader.onload=(ev)=>{content.innerHTML=`<img src="${ev.target.result}" id="previewImg" class="dropzone-preview"><div class="dropzone-uploading"><span class="spinner-sm"></span> Mengupload...</div>`;zone.classList.add('has-file')};
reader.readAsDataURL(file);
progress.style.display='block';bar.style.width='30%';
const formData=new FormData();
formData.append('file',file);
formData.append('category','gallery');
try{
bar.style.width='60%';
const res=await fetch(API+'/upload.php',{method:'POST',body:formData});
bar.style.width='90%';
const data=await res.json();
if(data.success){
bar.style.width='100%';bar.classList.add('done');
galleryUploadedUrl=data.url;
document.getElementById('f_image_url').value=data.url;
setTimeout(()=>{progress.style.display='none';bar.style.width='0';bar.classList.remove('done');const ch=document.querySelector('.dropzone-uploading');if(ch)ch.innerHTML='<i class="bi bi-check-circle-fill" style="color:var(--success)"></i> Upload berhasil';},500);
toast('Gambar berhasil diupload');
}else{toast(data.message||'Upload gagal','error');progress.style.display='none';bar.style.width='0'}
}catch(err){toast('Upload gagal: server error','error');progress.style.display='none';bar.style.width='0'}
}

async function saveGallery(e,id){
e.preventDefault();
const imgUrl=document.getElementById('f_image_url').value;
if(!imgUrl){toast('Upload gambar terlebih dahulu','error');return}
const b={title:document.getElementById('f_title').value,description:document.getElementById('f_description').value,image_url:imgUrl,category:document.getElementById('f_category').value};
try{const u=id?V2+`?module=gallery&id=${id}`:V2+'?module=gallery';await fetch(u,{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});toast('Tersimpan');closeModal();await loadAllData();showPage('gallery')}catch(err){toast('Error','error')}
}

// TESTIMONIALS
PAGES.testimonials=()=>`<div class="page-header"><h1>Testimoni</h1><p>Kelola ulasan orang tua siswa.</p></div><div class="panel"><div class="panel-header"><div class="panel-title"><i class="bi bi-chat-heart-fill"></i> Testimoni</div><button class="btn btn-primary btn-sm" onclick="modalTestimonial()"><i class="bi bi-plus-lg"></i> Tambah</button></div><div class="table-wrapper"><table class="data-table"><thead><tr><th>Orang Tua</th><th>Rating</th><th>Pesan</th><th>Visible</th><th>Aksi</th></tr></thead><tbody id="tblTestimonials"></tbody></table></div></div>`;
INIT.testimonials=()=>{document.getElementById('tblTestimonials').innerHTML=D.testimonials.map(t=>`<tr><td><strong>${E(t.parent_name)}</strong><br><small style="color:var(--text-muted)">${E(t.student_name||'')}</small></td><td>${'Ã¢Ëœâ€¦'.repeat(t.rating||5)}${'Ã¢Ëœâ€ '.repeat(5-(t.rating||5))}</td><td style="max-width:300px">${E((t.message||'').slice(0,80))}...</td><td><button class="btn btn-sm ${t.is_visible==1?'btn-success':'btn-outline'}" onclick="toggleV2('testimonials',${t.id})">${t.is_visible==1?'Ya':'Tidak'}</button></td><td><div class="action-btns"><button class="btn btn-ghost btn-icon" onclick="modalTestimonial(${t.id})"><i class="bi bi-pencil"></i></button><button class="btn btn-ghost btn-icon" style="color:var(--danger)" onclick="delV2('testimonials',${t.id})"><i class="bi bi-trash3"></i></button></div></td></tr>`).join('')||'<tr><td colspan="5"><div class="empty-state"><p>Belum ada testimoni</p></div></td></tr>'};
function modalTestimonial(id){const t=id?D.testimonials.find(x=>x.id==id):null;openModal(`<div class="modal-header"><h3>${t?'Edit':'Tambah'} Testimoni</h3><button class="modal-close" onclick="closeModal()"><i class="bi bi-x-lg"></i></button></div><div class="modal-body"><form onsubmit="saveV2(event,'testimonials',${id||0},['parent_name','student_name','rating','message'])"><div class="form-row"><div class="form-group"><label class="form-label">Nama Orang Tua *</label><input class="form-control" id="f_parent_name" value="${E(t?.parent_name||'')}" required></div><div class="form-group"><label class="form-label">Nama Siswa</label><input class="form-control" id="f_student_name" value="${E(t?.student_name||'')}"></div></div><div class="form-group"><label class="form-label">Rating</label><select class="form-control" id="f_rating">${[5,4,3,2,1].map(r=>`<option ${(t?.rating||5)==r?'selected':''}>${r}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">Pesan *</label><textarea class="form-control" id="f_message" required>${E(t?.message||'')}</textarea></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div></form></div>`)}

// EVENTS/CALENDAR â€” with visual calendar
let calYear,calMonth;
PAGES.events=()=>{const now=new Date();calYear=now.getFullYear();calMonth=now.getMonth();return `<div class="page-header"><h1>Jadwal & Kalender</h1><p>Kelola jadwal kelas dan event.</p></div>
<div class="grid-2">
<div class="panel"><div class="panel-header"><div class="panel-title"><i class="bi bi-calendar3"></i> Kalender</div><div class="panel-actions"><button class="btn btn-ghost btn-icon btn-sm" onclick="changeMonth(-1)"><i class="bi bi-chevron-left"></i></button><span id="calMonthLabel" style="font-weight:700;min-width:140px;text-align:center;display:inline-block"></span><button class="btn btn-ghost btn-icon btn-sm" onclick="changeMonth(1)"><i class="bi bi-chevron-right"></i></button></div></div><div class="panel-body"><div id="calendarGrid" class="calendar-grid"></div></div></div>
<div class="panel"><div class="panel-header"><div class="panel-title"><i class="bi bi-list-ul"></i> <span id="calSelectedLabel">Semua Event</span></div><button class="btn btn-primary btn-sm" onclick="modalEvent()"><i class="bi bi-plus-lg"></i> Tambah</button></div><div class="panel-body" id="eventsList" style="max-height:420px;overflow-y:auto"></div></div>
</div>
<div class="panel" style="margin-top:16px"><div class="panel-header"><div class="panel-title"><i class="bi bi-calendar-event-fill"></i> Semua Events</div></div><div class="table-wrapper"><table class="data-table"><thead><tr><th>Judul</th><th>Tipe</th><th>Tanggal</th><th>Waktu</th><th>Aksi</th></tr></thead><tbody id="tblEvents"></tbody></table></div></div>`};
INIT.events=()=>{renderCalendar();renderEventTable()};
function renderEventTable(){document.getElementById('tblEvents').innerHTML=D.events.map(e=>`<tr><td><strong>${E(e.title)}</strong></td><td><span class="badge badge-${e.type==='holiday'?'danger':e.type==='class'?'primary':e.type==='meeting'?'warning':'info'}">${E(e.type)}</span></td><td>${fmtDate(e.event_date)}</td><td>${E(e.event_time||'-')}</td><td><div class="action-btns"><button class="btn btn-ghost btn-icon" onclick="modalEvent(${e.id})"><i class="bi bi-pencil"></i></button><button class="btn btn-ghost btn-icon" style="color:var(--danger)" onclick="delV2('events',${e.id})"><i class="bi bi-trash3"></i></button></div></td></tr>`).join('')||'<tr><td colspan="5"><div class="empty-state"><p>Belum ada event</p></div></td></tr>'}
function changeMonth(d){calMonth+=d;if(calMonth<0){calMonth=11;calYear--}if(calMonth>11){calMonth=0;calYear++}renderCalendar()}
function renderCalendar(){
const months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
document.getElementById('calMonthLabel').textContent=months[calMonth]+' '+calYear;
const first=new Date(calYear,calMonth,1).getDay();const days=new Date(calYear,calMonth+1,0).getDate();
const today=new Date();const isToday=(d)=>today.getFullYear()===calYear&&today.getMonth()===calMonth&&today.getDate()===d;
let html='<div class="cal-header"><span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span></div><div class="cal-body">';
for(let i=0;i<first;i++)html+='<div class="cal-day empty"></div>';
for(let d=1;d<=days;d++){
const dateStr=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const evts=D.events.filter(e=>e.event_date===dateStr);
const dots=evts.map(e=>{const c=e.type==='holiday'?'#ef4444':e.type==='class'?'#4f46e5':e.type==='meeting'?'#f59e0b':'#06b6d4';return`<span class="cal-dot" style="background:${c}"></span>`}).join('');
const cls=['cal-day'];if(isToday(d))cls.push('today');if(evts.length)cls.push('has-event');
html+=`<div class="${cls.join(' ')}" onclick="selectCalDay('${dateStr}')"><span class="cal-num">${d}</span>${dots?'<div class="cal-dots">'+dots+'</div>':''}</div>`;
}
html+='</div>';document.getElementById('calendarGrid').innerHTML=html;
renderEventList(null);
}
function selectCalDay(dateStr){
document.querySelectorAll('.cal-day').forEach(d=>d.classList.remove('selected'));
const days=document.querySelectorAll('.cal-day');
days.forEach(d=>{if(d.onclick&&d.onclick.toString().includes(dateStr))d.classList.add('selected')});
const evts=D.events.filter(e=>e.event_date===dateStr);
document.getElementById('calSelectedLabel').textContent=evts.length?`Event ${fmtDate(dateStr)}`:'Tidak ada event';
renderEventList(dateStr);
}
function renderEventList(dateStr){
const list=dateStr?D.events.filter(e=>e.event_date===dateStr):D.events.slice(0,10);
const el=document.getElementById('eventsList');
if(!list.length){el.innerHTML='<div class="empty-state" style="padding:24px"><i class="bi bi-calendar-x" style="font-size:2rem;color:var(--text-light)"></i><p style="margin-top:8px">Tidak ada event'+(dateStr?' di tanggal ini':'')+'</p>'+(dateStr?`<button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="modalEvent(0,'${dateStr}')"><i class="bi bi-plus-lg"></i> Tambah Event</button>`:'')+'</div>';return}
el.innerHTML=list.map(e=>{const c=e.type==='holiday'?'#ef4444':e.type==='class'?'#4f46e5':e.type==='meeting'?'#f59e0b':'#06b6d4';return`<div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid var(--border);transition:background .2s" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background=''"><div style="width:4px;height:40px;border-radius:4px;background:${c};flex-shrink:0"></div><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:.88rem">${E(e.title)}</div><div style="font-size:.78rem;color:var(--text-muted)">${fmtDate(e.event_date)} ${e.event_time?'â€¢ '+e.event_time:''}</div></div><span class="badge badge-${e.type==='holiday'?'danger':e.type==='class'?'primary':e.type==='meeting'?'warning':'info'}" style="flex-shrink:0">${E(e.type)}</span><button class="btn btn-ghost btn-icon btn-sm" onclick="modalEvent(${e.id})"><i class="bi bi-pencil"></i></button></div>`}).join('')}
function modalEvent(id,prefillDate){const e2=id?D.events.find(x=>x.id==id):null;openModal(`<div class="modal-header"><h3>${e2?'Edit':'Tambah'} Event</h3><button class="modal-close" onclick="closeModal()"><i class="bi bi-x-lg"></i></button></div><div class="modal-body"><form onsubmit="saveV2(event,'events',${id||0},['title','description','event_date','event_time','type','color'])"><div class="form-group"><label class="form-label">Judul *</label><input class="form-control" id="f_title" value="${E(e2?.title||'')}" required></div><div class="form-row"><div class="form-group"><label class="form-label">Tanggal *</label><input class="form-control" type="date" id="f_event_date" value="${e2?.event_date||prefillDate||''}" required></div><div class="form-group"><label class="form-label">Waktu</label><input class="form-control" type="time" id="f_event_time" value="${e2?.event_time||''}"></div></div><div class="form-group"><label class="form-label">Tipe</label><select class="form-control" id="f_type"><option ${e2?.type==='event'?'selected':''}>event</option><option ${e2?.type==='class'?'selected':''}>class</option><option ${e2?.type==='holiday'?'selected':''}>holiday</option><option ${e2?.type==='meeting'?'selected':''}>meeting</option></select></div><div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-control" id="f_description">${E(e2?.description||'')}</textarea></div><div class="form-group"><label class="form-label">Warna</label><input class="form-control" type="color" id="f_color" value="${e2?.color||'#4f46e5'}" style="height:42px;padding:4px"></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div></form></div>`)}

// CONTACTS
PAGES.contacts=()=>`<div class="page-header"><h1>Kontak Masuk</h1><p>Pesan dari calon pendaftar.</p></div><div class="panel"><div class="panel-header"><div class="search-box"><i class="bi bi-search"></i><input placeholder="Cari..." oninput="filterTbl('contacts',this.value)"></div></div><div class="table-wrapper"><table class="data-table"><thead><tr><th>Pengirim</th><th>Subjek</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr></thead><tbody id="tblContacts"></tbody></table></div></div>`;
INIT.contacts=()=>renderContacts(D.contacts);
function renderContacts(l){document.getElementById('tblContacts').innerHTML=l.length?l.map(c=>`<tr><td><strong>${E(c.name)}</strong><br><small style="color:var(--text-muted)">${E(c.email||c.phone||'')}</small></td><td>${E(c.subject||'-')}<br><small style="color:var(--text-muted)">${E((c.message||'').slice(0,50))}...</small></td><td><span class="badge ${c.status==='unread'?'badge-danger':c.status==='replied'?'badge-success':'badge-info'}">${c.status}</span></td><td>${fmtDate(c.created_at)}</td><td><div class="action-btns"><button class="btn btn-ghost btn-icon" onclick="viewContact(${c.id})"><i class="bi bi-eye"></i></button><button class="btn btn-ghost btn-icon" style="color:var(--danger)" onclick="delV2('contacts',${c.id})"><i class="bi bi-trash3"></i></button></div></td></tr>`).join(''):'<tr><td colspan="5"><div class="empty-state"><p>Belum ada pesan</p></div></td></tr>'}
function viewContact(id){const c=D.contacts.find(x=>x.id==id);if(!c)return;if(c.status==='unread')fetch(V2+`?module=contacts&id=${id}&action=status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'read'})}).catch(()=>{});openModal(`<div class="modal-header"><h3>Detail Pesan</h3><button class="modal-close" onclick="closeModal()"><i class="bi bi-x-lg"></i></button></div><div class="modal-body"><p><strong>Dari:</strong> ${E(c.name)}</p><p><strong>Email:</strong> ${E(c.email||'-')}</p><p><strong>Telepon:</strong> ${E(c.phone||'-')}</p><p><strong>Subjek:</strong> ${E(c.subject||'-')}</p><hr><p>${E(c.message)}</p>${c.admin_reply?`<hr><p><strong>Balasan:</strong></p><p>${E(c.admin_reply)}</p>`:''}<hr><form onsubmit="replyContact(event,${id})"><div class="form-group"><label class="form-label">Balas</label><textarea class="form-control" id="fReply">${E(c.admin_reply||'')}</textarea></div><div class="modal-footer"><button type="submit" class="btn btn-primary"><i class="bi bi-reply"></i> Kirim Balasan</button></div></form></div>`)}
async function replyContact(e,id){e.preventDefault();try{await fetch(V2+`?module=contacts&id=${id}&action=reply`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({admin_reply:g('fReply')})});toast('Balasan terkirim');closeModal();await loadAllData();renderContacts(D.contacts)}catch(e){toast('Error','error')}}

// === CMS HELPERS ===
async function saveCms(e,type,id){e.preventDefault();const fields={banners:['title','subtitle','image_url','link_url']};const b={};(fields[type]||[]).forEach(f=>{const el=document.getElementById('fB'+f.charAt(0).toUpperCase()+f.slice(1).replace(/_./g,m=>m[1].toUpperCase()));if(!el){const m={'title':'fBtitle','subtitle':'fBsub','image_url':'fBimg','link_url':'fBlink'};const el2=document.getElementById(m[f]);if(el2)b[f]=el2.value}else b[f]=el.value});b.title=document.getElementById('fBtitle')?.value||'';b.subtitle=document.getElementById('fBsub')?.value||'';b.image_url=document.getElementById('fBimg')?.value||'';b.link_url=document.getElementById('fBlink')?.value||'';try{const u=id?`${API}/cms.php?type=${type}&id=${id}`:API+`/cms.php?type=${type}`;await fetch(u,{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});toast('Tersimpan');closeModal();await loadAllData();showPage(type)}catch(e){toast('Error','error')}}
async function toggleCms(type,id){try{await fetch(`${API}/cms.php?type=${type}&id=${id}&action=toggle`,{method:'PATCH'});await loadAllData();showPage(type==='banners'?'banners':'announcements')}catch(e){toast('Error','error')}}
async function delCms(type,id){showConfirm('Hapus?',async()=>{try{await fetch(`${API}/cms.php?type=${type}&id=${id}`,{method:'DELETE'});toast('Dihapus');await loadAllData();showPage(type==='banners'?'banners':'announcements')}catch(e){toast('Error','error')}})}
async function toggleV2(mod,id){try{await fetch(V2+`?module=${mod}&id=${id}&action=toggle`,{method:'PATCH'});await loadAllData();showPage(mod)}catch(e){toast('Error','error')}}

// GENERIC V2 SAVE
async function saveV2(e,mod,id,fields){e.preventDefault();const b={};fields.forEach(f=>{b[f]=document.getElementById('f_'+f)?.value||''});try{const u=id?V2+`?module=${mod}&id=${id}`:V2+`?module=${mod}`;await fetch(u,{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});toast('Tersimpan');closeModal();await loadAllData();showPage(mod)}catch(e){toast('Error','error')}}
