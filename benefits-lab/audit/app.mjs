
import {buildAuditData,reconcileBenefits,auditBrief,amount,toCsv} from './core.mjs';
const el=id=>document.getElementById(id);
const data=buildAuditData();
let report;
let selected=null;
const safe=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const choice=id=>el(id).value;
function download(name,text){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
function rerun(){
  report=reconcileBenefits(data);
  el('metrics').innerHTML=[
    ['HRIS employees',report.employeeCount],['Vendor enrollments',report.vendorCount],
    ['Audit exceptions',report.cases.length],['High-risk findings',report.highRisk]
  ].map(([k,v])=>'<div class="metric"><small>'+safe(k)+'</small><b>'+v+'</b></div>').join('');
  el('kind').innerHTML='<option value="">All issue types</option>'+Object.keys(report.byType).map(k=>'<option>'+safe(k)+'</option>').join('');
  el('costs').innerHTML=Object.entries(report.totals).map(([country,x])=>'<div class="panel" style="background:#f8fbff"><div class="tag">'+(country==='IN'?'India':'United Kingdom')+'</div><h3>Expected '+amount(x.expected,x.currency)+'</h3><p>Billed '+amount(x.billed,x.currency)+'</p><p class="small">Difference: '+amount(x.billed-x.expected,x.currency)+' (not a validated recovery)</p></div>').join('');
  el('breakdown').innerHTML=Object.entries(report.byType).sort((a,b)=>b[1]-a[1]).map(([type,count])=>'<div class="barrow"><label title="'+safe(type)+'">'+safe(type)+'</label><div class="track"><span style="width:'+Math.max(4,count/report.cases.length*100)+'%"></span></div><b>'+count+'</b></div>').join('');
  selected=null;el('detail').textContent='Select an exception to inspect the recommended control response.';
  el('status').textContent='Audit complete · '+report.invoiceCount+' invoice rows checked';
  renderRows();
}
function renderRows(){
  const filtered=report.cases.filter(x=>(!choice('country')||x.country===choice('country'))&&(!choice('severity')||x.severity===choice('severity'))&&(!choice('kind')||x.type===choice('kind'))&&[x.employeeId,x.type,x.caseId].join(' ').toLowerCase().includes(choice('search').toLowerCase()));
  el('result-count').textContent=filtered.length+' matching findings from '+report.cases.length+' total';
  el('rows').innerHTML=filtered.slice(0,180).map(x=>'<tr data-id="'+x.caseId+'" class="'+(selected===x.caseId?'selected':'')+'" style="cursor:pointer"><td class="code">'+safe(x.caseId)+'</td><td class="code">'+safe(x.employeeId)+'</td><td>'+x.country+'</td><td>'+safe(x.type)+'</td><td><span class="pill '+x.severity.toLowerCase()+'">'+x.severity+'</span></td><td>'+safe(x.owner)+'</td></tr>').join('');
  for(const row of el('rows').querySelectorAll('tr'))row.addEventListener('click',()=>selectCase(row.dataset.id));
}
function selectCase(id){
  selected=id;const x=report.cases.find(c=>c.caseId===id);if(!x)return;
  el('detail').innerHTML='<strong>'+safe(x.caseId)+' · '+safe(x.type)+'</strong><p><b>Evidence:</b> '+safe(x.detail)+'</p><p><b>Recommended next step:</b> '+safe(x.action)+'</p><p><b>Owner:</b> '+safe(x.owner)+'</p><p class="small">Do not auto-change enrollment without human and vendor verification.</p>';
  renderRows();
}
function aiPrompt(){return 'You are an employee benefits operations analyst. Draft a concise monthly management summary with 3 risks, 3 recommended actions, and a validation checklist. Do not invent savings, assume policy rules are real, or claim a real employer was audited. Human review is mandatory. Aggregate synthetic data only:\n'+JSON.stringify(auditBrief(report),null,2);}
el('rerun').addEventListener('click',rerun);
el('export').addEventListener('click',()=>download('synthetic-benefits-exceptions.csv',toCsv(report.cases,['caseId','employeeId','country','type','severity','detail','action','owner'])));
el('brief').addEventListener('click',()=>{el('ai-section').style.display='block';el('prompt').textContent=aiPrompt();el('ai-section').scrollIntoView({behavior:'smooth'});});
el('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(aiPrompt());el('copy').textContent='Copied ✓';}catch{el('copy').textContent='Select the prompt above to copy';}});
for(const id of ['country','severity','kind','search'])el(id).addEventListener(id==='search'?'input':'change',renderRows);
rerun();
