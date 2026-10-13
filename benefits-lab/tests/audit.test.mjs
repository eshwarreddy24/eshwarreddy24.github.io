
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAuditData,reconcileBenefits,RULES,toCsv,auditBrief} from '../audit/core.mjs';
test('audit builds 600 fully fabricated employees and two separate currencies',()=>{
  const d=buildAuditData();assert.equal(d.employees.length,600);
  assert.equal(new Set(d.employees.map(x=>x.country)).size,2);
  assert.equal(RULES.IN.currency,'INR');assert.equal(RULES.UK.currency,'GBP');
  assert.ok(d.invoices.length>500);
});
test('reconciliation flags all seeded exception families',()=>{
  const result=reconcileBenefits(buildAuditData());
  for(const type of ['Missing enrollment','Post-exit coverage','Plan mismatch','Dependent eligibility','Unknown vendor member','Duplicate invoice','Premium variance'])
    assert.ok(result.byType[type]>0,'Missing '+type);
  assert.ok(result.cases.every(c=>c.caseId&&c.employeeId&&c.action&&c.owner));
  assert.ok(result.highRisk>0);
});
test('audit is deterministic and invoice currencies do not merge',()=>{
  const a=reconcileBenefits(buildAuditData());
  const b=reconcileBenefits(buildAuditData());
  assert.deepEqual(a.byType,b.byType);assert.deepEqual(a.totals,b.totals);
  assert.equal(a.totals.IN.currency,'INR');assert.equal(a.totals.UK.currency,'GBP');
  assert.equal(auditBrief(a).records,600);
});
test('CSV escapes spreadsheet-injection prefixes',()=>{
  const csv=toCsv([{issue:'=1+1',action:'+bad'}],['issue','action']);
  assert.ok(csv.includes("'=1+1"));assert.ok(csv.includes("'+bad"));
});
