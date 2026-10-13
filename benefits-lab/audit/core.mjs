/**
 * Synthetic benefits operations model. No real employee data, rates or country-law claims.
 * Reconciliation period: September 2026. All currencies remain separated.
 */
export const PERIOD = '2026-09';
export const RULES = Object.freeze({
  IN:{currency:'INR',base:1800,plus:3100,dependentMaxAge:25},
  UK:{currency:'GBP',base:48,plus:79,dependentMaxAge:21}
});
const pad=n=>String(n).padStart(4,'0');
export const amount=(value,currency)=>new Intl.NumberFormat('en-GB',{style:'currency',currency,maximumFractionDigits:0}).format(value);
export function expectedPremium(employee){
  const r=RULES[employee.country];
  return employee.plan==='Plus'?r.plus:r.base;
}
export function buildAuditData(){
  const employees=[];
  const vendors=[];
  const invoices=[];
  for(let i=1;i<=600;i++){
    const country=i%2===0?'IN':'UK';
    const inactive=i%29===0;
    const e={id:'E'+pad(i),country,plan:i%3===0?'Plus':'Base',status:inactive?'Inactive':'Active',
      hireDate:'2025-07-01',exitDate:inactive?'2026-08-15':'',dependentAge:i%47===0?30:(i%3===0?14:null)};
    employees.push(e);
    if(inactive&&i%58!==0)continue;
    if(!inactive&&i%67===0)continue;
    const vendorPlan=i%71===0?(e.plan==='Plus'?'Base':'Plus'):e.plan;
    vendors.push({employeeId:e.id,country,plan:vendorPlan,effectiveDate:'2026-09-01'});
    const charge=expectedPremium(e)+(i%53===0?(country==='IN'?450:12):0);
    invoices.push({invoiceId:'INV-'+pad(i),employeeId:e.id,country,amount:charge,currency:RULES[country].currency,period:PERIOD});
    if(i%89===0)invoices.push({invoiceId:'DUP-'+pad(i),employeeId:e.id,country,amount:charge,currency:RULES[country].currency,period:PERIOD});
  }
  vendors.push({employeeId:'E9999',country:'IN',plan:'Base',effectiveDate:'2026-09-01'});
  invoices.push({invoiceId:'INV-9999',employeeId:'E9999',country:'IN',amount:1800,currency:'INR',period:PERIOD});
  return {employees,vendors,invoices,period:PERIOD};
}
export function reconcileBenefits(data,threshold=0){
  const emp=new Map(data.employees.map(e=>[e.id,e]));
  const vendor=new Map();
  const billedByEmployee=new Map();
  const cases=[];
  let sequence=0;
  const flag=(type,severity,id,country,detail,action,owner='Benefits Operations')=>{
    cases.push({caseId:'AUD-'+String(++sequence).padStart(3,'0'),type,severity,employeeId:id,country,detail,action,owner});
  };
  for(const v of data.vendors){
    const list=vendor.get(v.employeeId)||[];list.push(v);vendor.set(v.employeeId,list);
    const e=emp.get(v.employeeId);
    if(!e)flag('Unknown vendor member','High',v.employeeId,v.country,'Vendor member is absent from the HRIS master.','Verify source ID with vendor; stop unsupported billing pending review.','Vendor Management');
    else if(e.status==='Inactive')flag('Post-exit coverage','High',e.id,e.country,'Vendor still shows coverage although recorded exit was 2026-08-15.','Validate coverage end-date and request vendor correction.','Benefits + Payroll');
    else if(v.plan!==e.plan)flag('Plan mismatch','Medium',e.id,e.country,'HRIS plan '+e.plan+' differs from vendor plan '+v.plan+'.','Review approved enrollment election and correct mismatched source.','Benefits + Vendor');
  }
  for(const e of data.employees){
    if(e.status==='Active'&&!vendor.has(e.id))flag('Missing enrollment','High',e.id,e.country,'Eligible active employee absent from vendor enrollment.','Confirm effective date, urgently submit enrollment, and check access to care.','Benefits + Vendor');
    const rule=RULES[e.country];
    if(e.dependentAge!==null&&e.dependentAge>rule.dependentMaxAge)
      flag('Dependent eligibility','Medium',e.id,e.country,'Dependent age '+e.dependentAge+' exceeds illustrative '+e.country+' policy limit '+rule.dependentMaxAge+'.','Verify dependent evidence and actual plan rules with administrator.','Benefits');
  }
  for(const invoice of data.invoices){
    const list=billedByEmployee.get(invoice.employeeId)||[];list.push(invoice);billedByEmployee.set(invoice.employeeId,list);
    const e=emp.get(invoice.employeeId);
    if(!e)continue;
    if(invoice.country!==e.country||invoice.currency!==RULES[e.country].currency)
      flag('Currency / country mismatch','High',e.id,e.country,'Invoice currency or country does not match HRIS policy.','Revalidate file mapping and invoice source.','Finance');
    if(e.status==='Active'&&Math.abs(invoice.amount-expectedPremium(e))>threshold)
      flag('Premium variance','Medium',e.id,e.country,'Invoiced '+amount(invoice.amount,invoice.currency)+' vs modeled '+amount(expectedPremium(e),RULES[e.country].currency)+'.','Check approved premiums, plan rate table, and effective date.','Finance + Vendor');
  }
  for(const [id,list] of billedByEmployee)if(list.length>1){
    const e=emp.get(id);
    flag('Duplicate invoice','High',id,e?.country||list[0].country,list.length+' charges found for one member in the same period.','Request credit and reconcile vendor invoice rows.','Finance + Vendor');
  }
  cases.sort((a,b)=>(a.severity==='High'?0:1)-(b.severity==='High'?0:1)||a.caseId.localeCompare(b.caseId));
  const totals={IN:{currency:'INR',expected:0,billed:0},UK:{currency:'GBP',expected:0,billed:0}};
  for(const e of data.employees)if(e.status==='Active')totals[e.country].expected+=expectedPremium(e);
  for(const v of data.invoices)if(totals[v.country])totals[v.country].billed+=v.amount;
  const byType=Object.fromEntries([...new Set(cases.map(c=>c.type))].sort().map(k=>[k,cases.filter(x=>x.type===k).length]));
  return {cases,totals,byType,employeeCount:data.employees.length,vendorCount:data.vendors.length,invoiceCount:data.invoices.length,
    highRisk:cases.filter(c=>c.severity==='High').length};
}
export function auditBrief(result){
  return {period:PERIOD,records:result.employeeCount,exceptions:result.cases.length,highRisk:result.highRisk,types:result.byType,
    totals:result.totals,disclaimer:'Synthetic aggregate metrics. Policy rates and eligibility are illustrative, not actual regulation.'};
}
export function toCsv(rows,columns){
  const quote=v=>'"'+String(v??'').replaceAll('"','""').replace(/^[=+@-]/,'\'$&')+'"';
  return [columns.map(quote).join(','),...rows.map(r=>columns.map(c=>quote(r[c])).join(','))].join('\n');
}
