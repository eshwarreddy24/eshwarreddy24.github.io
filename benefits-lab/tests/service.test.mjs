import test from 'node:test';
import assert from 'node:assert/strict';
import {AS_OF,buildServiceData,classify,summarizeService,suggestedReply,serviceBrief,SLA} from '../service/core.mjs';
test('deterministic synthetic ticket and onboarding data',()=>{
 const a=buildServiceData(),b=buildServiceData();
 assert.equal(a.tickets.length,200);assert.equal(a.onboarding.length,100);
 assert.deepEqual(a,b);assert.equal(a.asOf,AS_OF);
});
test('routes critical claims and flags elapsed SLA breach',()=>{
 const t=classify({id:'TKT-999',category:'Claims support',priority:'Critical',createdAt:'2026-10-01T05:00:00Z',resolvedAt:null},AS_OF);
 assert.equal(t.owner,'Vendor Liaison');assert.equal(t.slaHours,SLA.Critical);
 assert.equal(t.slaStatus,'Breached');assert.equal(t.status,'Open');
});
test('recognizes closed cases within SLA',()=>{
 const t=classify({category:'Enrollment issue',priority:'Normal',createdAt:'2026-09-29T00:00:00Z',resolvedAt:'2026-09-29T02:00:00Z'});
 assert.equal(t.slaStatus,'Met');assert.equal(t.ageHours,2);
});
test('summary counts are consistent and anonymized',()=>{
 const s=summarizeService(buildServiceData());
 assert.equal(s.ticketCount,200);assert.equal(s.onboardingTotal,100);
 assert.equal(s.open+s.closed,200);assert.equal(s.onboardingRate,s.onboardingComplete);
 assert.ok(s.slaBreaches>0);assert.equal(serviceBrief(s).tickets,200);
});
test('draft avoids claims approval and requires human review',()=>{
 const draft=suggestedReply(buildServiceData().tickets[0]);
 assert.match(draft,/HUMAN APPROVAL REQUIRED/);
 assert.match(draft,/not treat this draft as confirmation of coverage/i);
});
