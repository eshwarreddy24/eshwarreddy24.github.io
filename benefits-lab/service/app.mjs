import {buildServiceData,summarizeService,serviceBrief,suggestedReply,categories,toCsv} from './core.mjs';
const el=id=>document.getElementById(id),safe=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const data=buildServiceData();let report,selected;
const v=id=>el(id).value;
function csv(name,content){const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
function run(){
  report=summarizeService(data);
  el('metrics').innerHTML=[['Service cases',report.ticketCount],['Open cases',report.open],['SLA violations',report.slaBreaches],['Onboarding complete',report.onboardingRate+'%']].map(([k,val])=>'<div class="metric"><small>'+safe(k)+'</small><b>'+val+'</b></div>').join('');
  el('mix').innerHTML=Object.entries(report.byCategory).sort((a,b)=>b[1]-a[1]).map(([k,n])=>'<div class="barrow"><label>'+safe(k)+'</label><div class="track"><span style="width:'+Math.round(n/Math.max(...Object.values(report.byCategory))*100)+'%"></span></div><b>'+n+'</b></div>').join('');
  el('onboarding').innerHTML='<div class="metric"><small>Completed</small><b>'+report.onboardingComplete+'/'+report.onboardingTotal+'</b></div><div class="metric"><small>Pending steps</small><b>'+report.onboarding.filter(x=>Object.values(x.steps).some(y=>!y)).length+'</b></div>';
  el('onboardingRows').innerHTML=report.onboarding.filter(x=>Object.values(x.steps).some(y=>!y)).slice(0,15).map(x=>'<tr><td class="code">'+x.id+'</td><td>'+x.country+'</td><td>'+x.startDate+'</td><td>'+Object.values(x.steps).filter(Boolean).length+'/4 checks</td></tr>').join('');
  el('category').innerHTML='<option value="">All categories</option>'+categories.map(x=>'<option>'+safe(x)+'</option>').join('');
  el('status').textContent='Calculated as of 01 Oct 2026 (fixed simulation clock)';
  selected=null;el('detail').textContent='Select a ticket to view the recommended action.';el('response').disabled=true;el('draft').style.display='none';render();
}
function render(){
  const items=report.tickets.filter(t=>(!v('country')||t.country===v('country'))&&(!v('risk')||t.slaStatus===v('risk'))&&(!v('category')||t.category===v('category'))&&[t.id,t.employeeId,t.category].join(' ').toLowerCase().includes(v('search').toLowerCase()));
  el('count').textContent=items.length+' cases match · '+report.open+' currently open';
  el('rows').innerHTML=items.slice(0,200).map(t=>'<tr data-id="'+t.id+'" class="'+(selected===t.id?'selected':'')+'" style="cursor:pointer"><td class="code">'+t.id+'</td><td>'+t.country+'</td><td>'+safe(t.category)+'</td><td><span class="pill '+(t.priority==='Critical'||t.priority==='High'?'':t.priority==='Normal'?'medium':'low')+'">'+t.priority+'</span></td><td><span class="pill '+(t.slaStatus==='Met'||t.slaStatus==='Within SLA'?'low':t.slaStatus==='At risk'?'medium':'')+'">'+safe(t.slaStatus)+'</span></td><td>'+safe(t.owner)+'</td></tr>').join('');
  for(const tr of el('rows').querySelectorAll('tr'))tr.addEventListener('click',()=>showTicket(tr.dataset.id));
}
function showTicket(id){
  selected=id;const t=report.tickets.find(x=>x.id===id);
  if(!t)return;
  el('detail').innerHTML='<strong>'+safe(t.id)+' · '+safe(t.category)+'</strong><p><b>Priority:</b> '+t.priority+' · <b>Status:</b> '+t.status+'</p><p><b>Age:</b> '+t.ageHours+'h against '+t.slaHours+'h illustrative SLA</p><p><b>Owner:</b> '+safe(t.owner)+'</p><p><b>Next action:</b> '+safe(t.nextAction)+'</p>';
  el('response').disabled=false;el('draft').style.display='none';render();
}
function prompt(){return 'You are an employee benefits service operations analyst. Using ONLY the simulated aggregated metrics, draft a manager report with the top 3 service risks, a vendor follow-up plan, two onboarding actions, and limitations. Do not assume actual company policies, real employees, or confirmed savings. Human validation is required.\n'+JSON.stringify(serviceBrief(report),null,2);}
el('run').addEventListener('click',run);
el('export').addEventListener('click',()=>csv('synthetic-benefits-service-cases.csv',toCsv(report.tickets,['id','country','category','priority','status','slaHours','ageHours','slaStatus','owner','nextAction'])));
el('brief').addEventListener('click',()=>{el('ai-section').style.display='block';el('ai-prompt').textContent=prompt();el('ai-section').scrollIntoView({behavior:'smooth'});});
el('response').addEventListener('click',()=>{const t=report.tickets.find(x=>x.id===selected);if(!t)return;el('draft').style.display='block';el('draft').textContent=suggestedReply(t);});
el('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(prompt());el('copy').textContent='Copied ✓';}catch{el('copy').textContent='Select the prompt above to copy';}});
for(const id of ['country','risk','category','search'])el(id).addEventListener(id==='search'?'input':'change',render);
run();