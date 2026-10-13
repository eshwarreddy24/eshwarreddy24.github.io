export const AS_OF='2026-10-01T12:00:00Z';
export const SLA={Critical:4,High:12,Normal:48,Low:72};
export const categories=['Enrollment issue','Claims support','Dependent change','Coverage question','Premium / billing','New-joiner onboarding'];
export const route={'Enrollment issue':'Benefits Operations','Claims support':'Vendor Liaison','Dependent change':'Benefits Operations','Coverage question':'Benefits Helpdesk','Premium / billing':'Benefits + Payroll','New-joiner onboarding':'People Operations'};
const hoursBetween=(a,b)=>(new Date(b)-new Date(a))/3600000;
export function classify(ticket,asOf=AS_OF){
  const owner=route[ticket.category]??'Benefits Operations';
  const allowance=SLA[ticket.priority]??48;
  const ageHours=hoursBetween(ticket.createdAt,ticket.resolvedAt||asOf);
  const isClosed=Boolean(ticket.resolvedAt);
  const breached=ageHours>allowance;
  return {...ticket,owner,slaHours:allowance,ageHours:Math.round(ageHours*10)/10,status:isClosed?'Closed':'Open',
    slaStatus:isClosed?(breached?'Closed late':'Met'):breached?'Breached':ageHours>=allowance*0.75?'At risk':'Within SLA',
    nextAction:isClosed?'Verify employee confirmation and closure evidence.':
      ticket.category==='Claims support'?'Escalate claim status to insurer; keep employee updated.':
      ticket.category==='Premium / billing'?'Cross-check payroll deduction and vendor billing records.':
      ticket.priority==='Critical'?'Confirm coverage/access urgency and page benefits owner.':
      'Confirm source documents, eligibility, and next owner update.'};
}
export function buildServiceData(){
  const tickets=[];
  for(let i=1;i<=200;i++){
    const category=categories[(i*7+Math.floor(i/7))%categories.length];
    const priority=i%13===0?'Critical':i%7===0?'High':i%11===0?'Low':'Normal';
    const hoursAgo=2+(i*17)%168;
    const created=new Date(new Date(AS_OF).getTime()-hoursAgo*3600000);
    const shouldClose=i%5!==0;
    const allowance=SLA[priority];
    const duration=1+(i*3)%Math.max(6,allowance*2);
    const resolved=new Date(created.getTime()+duration*3600000);
    tickets.push({id:'TKT-'+String(i).padStart(3,'0'),employeeId:'SIM-'+String(1000+i),
      country:i%2===0?'IN':'UK',category,priority,createdAt:created.toISOString(),
      resolvedAt:shouldClose&&resolved<=new Date(AS_OF)?resolved.toISOString():null,
      summary:'Synthetic '+category.toLowerCase()+' request; review the appropriate plan document.'});
  }
  const onboarding=[];
  for(let i=1;i<=100;i++){
    const steps={welcome:i%11!==0,election:i%7!==0,dependentCheck:i%6!==0,vendorConfirmed:i%9!==0};
    onboarding.push({id:'ONB-'+String(i).padStart(3,'0'),employeeId:'NEW-'+String(i).padStart(3,'0'),
      country:i%2===0?'IN':'UK',startDate:'2026-09-'+String(1+i%28).padStart(2,'0'),steps});
  }
  return {tickets,onboarding,asOf:AS_OF};
}
export function summarizeService(data){
  const tickets=data.tickets.map(t=>classify(t,data.asOf));
  const opened=tickets.filter(t=>t.status==='Open');
  const closed=tickets.filter(t=>t.status==='Closed');
  const slaBreaches=tickets.filter(t=>['Breached','Closed late'].includes(t.slaStatus));
  const atRisk=tickets.filter(t=>t.slaStatus==='At risk');
  const resolvedWithinSla=closed.filter(t=>t.slaStatus==='Met');
  const complete=data.onboarding.filter(o=>Object.values(o.steps).every(Boolean)).length;
  const byCategory=Object.fromEntries(categories.map(c=>[c,tickets.filter(t=>t.category===c).length]));
  return {tickets,onboarding:data.onboarding,ticketCount:tickets.length,open:opened.length,closed:closed.length,
    slaBreaches:slaBreaches.length,atRisk:atRisk.length,
    resolutionRate:closed.length?Number((resolvedWithinSla.length/closed.length*100).toFixed(1)):0,
    onboardingTotal:data.onboarding.length,onboardingComplete:complete,
    onboardingRate:Number((100*complete/data.onboarding.length).toFixed(1)),byCategory,asOf:data.asOf};
}
export function suggestedReply(ticket){
  const c=classify(ticket);
  const info={
   'Enrollment issue':'We are checking the enrollment submission, effective date and insurer confirmation.',
   'Claims support':'We will verify the claim status with the insurance provider and share the documented next step.',
   'Dependent change':'We will review the dependent request against the applicable plan rules and enrollment window.',
   'Coverage question':'We will confirm coverage details with the current plan documents before providing guidance.',
   'Premium / billing':'We will compare payroll deduction and insurer billing records and correct any verified mismatch.',
   'New-joiner onboarding':'We will verify the onboarding checklist and benefits enrollment acknowledgment.'
  };
  return 'DRAFT • HUMAN APPROVAL REQUIRED\n\nHello,\n\nThank you for contacting the Benefits team. '+(info[c.category]||'We are reviewing your request.')+
    '\n\nWe will follow up after the responsible team confirms the details. Please do not treat this draft as confirmation of coverage, eligibility or claim approval.\n\nKind regards,\nBenefits Operations\n\nInternal owner: '+c.owner+
    '\nPriority: '+c.priority+' | Simulated target: '+c.slaHours+' elapsed hours.';
}
export function serviceBrief(summary){
  return {asOf:summary.asOf,tickets:summary.ticketCount,open:summary.open,closed:summary.closed,
    slaBreaches:summary.slaBreaches,atRisk:summary.atRisk,resolutionWithinSlaPercent:summary.resolutionRate,
    onboardingComplete:summary.onboardingComplete,onboardingTotal:summary.onboardingTotal,
    categories:summary.byCategory,disclaimer:'Synthetic training data; SLA targets are illustrative, not contractual.'};
}
export function toCsv(rows,columns){
  const q=v=>'"'+String(v??'').replaceAll('"','""').replace(/^[=+@-]/,"'$&")+'"';
  return [columns.map(q).join(','),...rows.map(row=>columns.map(key=>q(row[key])).join(','))].join('\n');
}
