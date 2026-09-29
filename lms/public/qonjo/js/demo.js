/* Interactive fictional workspaces, not an ERP or LMS backend.
 * Data stays in memory or sessionStorage. No credentials or real records.
 */
(() => {
  'use strict';
  const { icon, esc, modal, toast, closeModal } = window.Q;
  const service = document.body.dataset.serviceId;
  function stored(key, fallback) { try { const v=sessionStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
  function store(key,value) { try { sessionStorage.setItem(key,JSON.stringify(value)); } catch {} }
  const menu=document.querySelector('.app-menu-toggle');
  menu.addEventListener('click',()=>{ const open=document.querySelector('.app-sidebar').classList.toggle('open'); menu.setAttribute('aria-expanded',String(open)); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){document.querySelector('.app-sidebar').classList.remove('open');menu.setAttribute('aria-expanded','false');} });
  const initialAssets=[
    {id:'QNJ-001',name:'MacBook Pro 14-inch',category:'Computers',owner:'Design team',location:'Head office',status:'Assigned',serial:'DEMO-MBP-001',date:'2026-08-01'},
    {id:'QNJ-002',name:'Dell Latitude 5440',category:'Computers',owner:'Operations team',location:'Head office',status:'Assigned',serial:'DEMO-DLT-002',date:'2026-08-03'},
    {id:'QNJ-003',name:'Meeting room display',category:'Equipment',owner:'Shared services',location:'Meeting room A',status:'Available',serial:'DEMO-DSP-003',date:'2026-08-10'},
    {id:'QNJ-004',name:'HP LaserJet printer',category:'Equipment',owner:'Administration',location:'Head office',status:'Maintenance',serial:'DEMO-PRT-004',date:'2026-08-12'},
    {id:'QNJ-005',name:'Ergonomic office chair',category:'Furniture',owner:'Finance team',location:'Head office',status:'Assigned',serial:'DEMO-CHR-005',date:'2026-08-14'},
    {id:'QNJ-006',name:'Training laptop',category:'Computers',owner:'Learning team',location:'Training room',status:'Assigned',serial:'DEMO-LTP-006',date:'2026-08-17'},
    {id:'QNJ-007',name:'Portable projector',category:'Equipment',owner:'Unassigned',location:'Store room',status:'Available',serial:'DEMO-PRO-007',date:'2026-08-20'},
    {id:'QNJ-008',name:'Lenovo ThinkPad E14',category:'Computers',owner:'Field team',location:'Field office',status:'Assigned',serial:'DEMO-LNV-008',date:'2026-08-22'}
  ];
  const assetKey='qonjo.demo.assets.v1';
  const cached=stored(assetKey,initialAssets);
  let assets=Array.isArray(cached)&&cached.every(a=>a&&typeof a.id==='string'&&typeof a.name==='string') ? cached:initialAssets;
  const badge=s=>`<span class="badge ${s==='Assigned'?'badge-blue':s==='Maintenance'?'badge-amber':'badge-neutral'}">${esc(s)}</span>`;
  const glyph=a=>a.category==='Computers'?'laptop':a.category==='Furniture'?'grid':'box';
  function matches(){
    const term=document.getElementById('asset-search').value.trim().toLowerCase();
    const status=document.getElementById('asset-status').value, category=document.getElementById('asset-category').value;
    return assets.filter(a=>(status==='all'||status===a.status)&&(category==='all'||category===a.category)&&[a.id,a.name,a.owner,a.location].some(v=>String(v).toLowerCase().includes(term)));
  }
  function renderAssets(){
    const stats=[['Total assets',assets.length,'A single source of clarity','box'],...['Assigned','Available','Maintenance'].map(s=>[s,assets.filter(a=>a.status===s).length,s==='Assigned'?'With the right people':s==='Available'?'Ready for the next task':'A little care in progress',s==='Assigned'?'users':s==='Available'?'circle-check':'clock'])];
    document.getElementById('asset-stats').innerHTML=stats.map(([title,count,note,g])=>`<article class="dashboard-stat"><div class="stat-label"><span>${title}</span>${icon(g)}</div><strong>${count}</strong><small>${note}</small></article>`).join('');
    const rows=matches();
    document.getElementById('asset-rows').innerHTML=rows.length?rows.map(a=>`<tr><td><div class="asset-name"><span class="square-icon">${icon(glyph(a))}</span><span><b>${esc(a.name)}</b><small>${esc(a.category)}</small></span></div></td><td>${esc(a.id)}</td><td>${esc(a.owner)}</td><td>${esc(a.location)}</td><td>${badge(a.status)}</td><td><button class="icon-btn" data-asset="${esc(a.id)}" aria-label="View ${esc(a.name)} details">${icon('chevron')}</button></td></tr>`).join(''):'<tr><td colspan="6"><div class="empty-state">No matching assets. Try another search or filter.</div></td></tr>';
    document.getElementById('asset-result-count').textContent=`${assets.length} fictional records in your sample organization`;
    document.getElementById('asset-row-total').textContent=`${rows.length} of ${assets.length} records`;
  }
  function detail(id){
    const a=assets.find(a=>a.id===id);if(!a)return;
    modal(`<div class="eyebrow">Sample asset record</div><span class="square-icon">${icon(glyph(a))}</span><h2 id="dialog-title">${esc(a.name)}</h2>${badge(a.status)}<div class="detail-grid">${[['Asset tag',a.id],['Category',a.category],['Assigned to',a.owner],['Location',a.location],['Serial number',a.serial||'Not set'],['Added to sample register',a.date||'Today']].map(([k,v])=>`<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div><h3>A clear history.</h3><p>This fictional record illustrates how a portal can show ownership, location and lifecycle information together. Operational changes and audit trails belong in your connected asset application.</p><div class="dialog-actions"><button class="btn btn-outline" id="close-record">Back to the register ${icon('arrow-left')}</button></div>`);
    document.getElementById('close-record').addEventListener('click',closeModal);
  }
  function exportAssets(){
    const columns=['id','name','category','owner','location','status'];
    const cell=v=>'"'+String(v??'').replace(/^[=+@\-]/,v=>"'"+v).replaceAll('"','""')+'"';
    const csv=[columns.map(cell).join(','),...matches().map(a=>columns.map(k=>cell(a[k])).join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='QONJO_SAMPLE_ASSETS.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('Exported the filtered fictional records.');
  }
  function addAsset(){
    modal(`<div class="eyebrow">Try the interaction</div><h2 id="dialog-title">Give an asset a home.</h2><p>Use fictional details only. This record stays in your browser tab and is not sent to a server.</p><form id="sample-asset-form" class="form-stack"><div><label for="new-asset-name">Asset name</label><input id="new-asset-name" name="name" maxlength="70" placeholder="e.g. Training room laptop" required></div><div><label for="new-category">Category</label><select id="new-category" name="category"><option>Computers</option><option>Equipment</option><option>Furniture</option></select></div><div><label for="new-owner">Assigned to</label><input id="new-owner" name="owner" maxlength="50" placeholder="e.g. Demo team" required></div><div><label for="new-location">Location</label><input id="new-location" name="location" maxlength="50" placeholder="e.g. Sample office" required></div><div><label for="new-status">Status</label><select id="new-status" name="status"><option>Assigned</option><option>Available</option><option>Maintenance</option></select></div><button class="btn btn-primary full-width" type="submit">Add sample record ${icon('plus')}</button></form>`);
    document.getElementById('sample-asset-form').addEventListener('submit',e=>{
      e.preventDefault();if(!e.currentTarget.reportValidity())return;const d=new FormData(e.currentTarget);
      const name=String(d.get('name')).trim(),owner=String(d.get('owner')).trim(),location=String(d.get('location')).trim();
      if(!name||!owner||!location){toast('Please enter a name, team and location.');return;}
      const number=Math.max(0,...assets.map(a=>Number(String(a.id).split('-').at(-1))||0))+1;
      assets.push({id:`QNJ-${String(number).padStart(3,'0')}`,name,category:String(d.get('category')),owner,location,status:String(d.get('status')),serial:'DEMO-NEW',date:new Date().toISOString().slice(0,10)});
      store(assetKey,assets);closeModal();renderAssets();toast('Sample asset added. This tab only; no server submission.');
    });
  }
  const courses=[
    {id:'security',name:'Security essentials',category:'Security',description:'Small choices that help protect your everyday work.',lessons:6,minutes:25,glyph:'shield',style:'',lessonTitle:'Pause before you act',text:'An unexpected request deserves a moment of attention. The habit we are practicing is simple: pause, check the context, and use your organization’s reporting route when something feels wrong.',points:['Notice unexpected urgency, unfamiliar senders or requests outside the normal workflow.','Verify through a contact route you already trust instead of replying to a suspicious message.','Follow your organization’s security guidance and report concerns promptly.'],question:'An unfamiliar message asks you to approve an urgent payment. What is the best next step?',choices:['Follow the link and approve it immediately.','Verify the request through your established internal process.','Forward it to every contact.'],answer:1,feedback:'Verification through an established process is the intended habit in this example.'},
    {id:'phishing',name:'Recognize phishing',category:'Security',description:'Take a closer look before you click, reply or share.',lessons:4,minutes:12,glyph:'mail',style:'art-violet',lessonTitle:'Read the request, not just the name',text:'A familiar display name does not tell the whole story. This sample lesson is about slowing down long enough to assess what a message asks you to do.',points:['Look at the actual sender address and the context of the conversation.','Treat unexpected requests for credentials or sensitive information as a reason to verify.','Use your organization’s approved process to report the message.'],question:'What should you do when a message unexpectedly requests your sign-in details?',choices:['Send your password because the display name looks familiar.','Verify independently and use the approved reporting process.','Enter your password into the linked page to test it.'],answer:1,feedback:'Independent verification and the approved reporting route are the intended response.'},
    {id:'assets',name:'Asset care basics',category:'Operations',description:'Make ownership and handovers a little clearer.',lessons:4,minutes:18,glyph:'box',style:'art-cyan',lessonTitle:'A handover is more than a change of hands',text:'A good handover leaves the next person with the item, the information they need, and a record of who now owns the responsibility.',points:['Check the asset tag and confirm the condition of the item.','Record the new owner and location through the approved process.','Make sure the receiving person knows how to obtain support.'],question:'Which details are useful in an asset handover?',choices:['Only the item’s color.','The asset tag, condition, new owner and location.','No details are needed.'],answer:1,feedback:'Those details help people understand what changed and where the asset belongs.'},
    {id:'welcome',name:'Find your Qonjo rhythm',category:'Getting started',description:'A quick introduction to a more familiar workday.',lessons:3,minutes:10,glyph:'spark',style:'art-dark',lessonTitle:'Find the right workspace',text:'Each Qonjo entry point has a clear purpose. The asset workspace focuses on the things you use; the learning space focuses on the skills you build.',points:['Choose Assets for asset records and ownership.','Choose Learn for courses and learning progress.','Use the sign-in method enabled by your organization.'],question:'Where would you open a training course?',choices:['Qonjo Assets.','Qonjo Learn.','The browser settings page.'],answer:1,feedback:'Qonjo Learn is the intended home for courses and learning progress.'}
  ];
  const progressKey='qonjo.demo.lessons.v1',priorProgress=stored(progressKey,[]);
  let completed=Array.isArray(priorProgress)?priorProgress.filter(id=>courses.some(c=>c.id===id)):[],courseFilter='all';
  function renderCourses(){
    const term=document.getElementById('course-search').value.trim().toLowerCase();
    const result=courses.filter(c=>(courseFilter==='all'||c.category===courseFilter)&&`${c.name} ${c.description}`.toLowerCase().includes(term));
    document.getElementById('course-grid').innerHTML=result.length?result.map(c=>`<article class="course-card"><div class="course-art ${c.style}">${icon(c.glyph)}</div><div class="course-card-content"><span class="mini-kicker">${c.category.toUpperCase()}</span><h3>${c.name}</h3><p>${c.description}</p><div class="course-meta"><span>${icon('book')} ${c.lessons} lessons</span><span>${icon('clock')} ${c.minutes} min</span></div><button class="text-btn" data-course="${c.id}"><span>${completed.includes(c.id)?'Review sample lesson':'Explore sample lesson'}</span>${icon(completed.includes(c.id)?'circle-check':'arrow')}</button></div></article>`).join(''):'<div class="empty-state">No matching sample courses. Try another term.</div>';
    const pct=Math.round(completed.length/courses.length*100);document.getElementById('learning-percent').textContent=`${pct}%`;document.getElementById('learning-ring').style.setProperty('--progress',`${pct}%`);
    document.getElementById('learning-summary').textContent=`${completed.length} of ${courses.length} available sample lessons explored. This is not an official training record.`;
  }
  function lesson(id){
    const c=courses.find(c=>c.id===id);if(!c)return;
    modal(`<div class="eyebrow">Qonjo Learn / sample lesson</div><span class="square-icon cyan">${icon(c.glyph)}</span><h2 id="dialog-title">${c.lessonTitle}</h2><p>${c.text}</p><ul class="lesson-list">${c.points.map(p=>`<li>${p}</li>`).join('')}</ul><h3>A quick check.</h3><p>${c.question}</p><form id="lesson-quiz"><fieldset style="border:0;padding:0;margin:0"><legend class="sr-only">${c.question}</legend>${c.choices.map((v,i)=>`<label class="lesson-choice"><input type="radio" name="answer" value="${i}" required><span>${v}</span></label>`).join('')}</fieldset><div class="quiz-result" id="quiz-result" role="status" hidden></div><div class="dialog-actions"><button type="submit" class="btn btn-primary">Check answer ${icon('check')}</button><button type="button" class="btn btn-outline" id="complete-lesson" disabled>Mark sample complete</button></div></form><p class="inline-note" style="margin-top:18px">One illustrative lesson is supplied per course card. Full course outlines are design examples; no certificate or compliance completion is issued.</p>`);
    document.getElementById('lesson-quiz').addEventListener('submit',e=>{
      e.preventDefault();const selected=new FormData(e.currentTarget).get('answer');if(selected===null)return;
      const correct=Number(selected)===c.answer,result=document.getElementById('quiz-result');result.hidden=false;result.textContent=correct?`That’s it. ${c.feedback}`:'Take another look at the lesson and try again.';document.getElementById('complete-lesson').disabled=!correct;
    });
    document.getElementById('complete-lesson').addEventListener('click',()=>{if(!completed.includes(id))completed.push(id);store(progressKey,completed);closeModal();renderCourses();toast('Sample progress updated in this tab only.');});
  }
  function sideView(view){
    if(view===(service==='assets'?'inventory':'my-learning')){document.querySelector('.app-sidebar').classList.remove('open');menu.setAttribute('aria-expanded','false');document.getElementById('main').scrollIntoView({behavior:window.Q.paused()?'auto':'smooth'});return;}
    if(service==='assets'){
      if(view==='reports'){exportAssets();return;}
      const key=view==='locations'?'location':'owner';
      const counts=assets.reduce((m,a)=>(m[a[key]]=(m[a[key]]||0)+1,m),Object.create(null));
      modal(`<div class="eyebrow">Sample workspace overview</div><h2 id="dialog-title">${view==='locations'?'A place for everything.':'The right hands.'}</h2><p>Grouped from the fictional records in this tab.</p><div class="detail-grid">${Object.entries(counts).map(([name,count])=>`<div><small>${esc(name)}</small><b>${count} sample ${count===1?'asset':'assets'}</b></div>`).join('')}</div>`);
    }else if(view==='my-progress'){
      modal(`<div class="eyebrow">Sample learning progress</div><h2 id="dialog-title">Small steps add up.</h2><p>${completed.length} of ${courses.length} sample lessons explored in this tab. This is not a training or compliance record.</p>${courses.map(c=>`<div class="principle"><span>${icon(completed.includes(c.id)?'circle-check':'clock')}</span><div><h4>${c.name}</h4><p>${completed.includes(c.id)?'Sample explored':'Ready to explore'}</p></div></div>`).join('')}`);
    }else{
      modal(`<div class="eyebrow">Illustrative learning paths</div><h2 id="dialog-title">A little direction.</h2><p>A suggested grouping for the sample collection, not a live enrollment.</p><div class="principle"><span>01</span><div><h4>Start with confidence.</h4><p>Find your Qonjo rhythm → Security essentials → Recognize phishing</p></div></div><div class="principle"><span>02</span><div><h4>Care for what you use.</h4><p>Find your Qonjo rhythm → Asset care basics</p></div></div>`);
    }
  }
  if(service==='assets'){
    document.getElementById('asset-search').addEventListener('input',renderAssets);document.getElementById('asset-status').addEventListener('change',renderAssets);document.getElementById('asset-category').addEventListener('change',renderAssets);document.getElementById('export-assets').addEventListener('click',exportAssets);document.getElementById('add-asset').addEventListener('click',addAsset);renderAssets();
  }else{
    document.getElementById('course-search').addEventListener('input',renderCourses);document.getElementById('reset-progress').addEventListener('click',()=>{completed=[];store(progressKey,completed);renderCourses();toast('Demo progress reset.');});
    document.querySelectorAll('[data-course-filter]').forEach(btn=>btn.addEventListener('click',()=>{courseFilter=btn.dataset.courseFilter;document.querySelectorAll('[data-course-filter]').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});renderCourses();}));renderCourses();
  }
  document.addEventListener('click',e=>{const a=e.target.closest('[data-asset]');if(a)detail(a.dataset.asset);const c=e.target.closest('[data-course]');if(c)lesson(c.dataset.course);const s=e.target.closest('[data-side-view]');if(s)sideView(s.dataset.sideView);});
})();
