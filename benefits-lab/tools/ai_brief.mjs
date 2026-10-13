#!/usr/bin/env node
/**
 * Optional AI-assisted manager brief. Only aggregate synthetic metrics
 * are sent to a model provider. No employee identifiers or claim data.
 *
 * Without OPENAI_API_KEY, it produces a complete deterministic fallback.
 * GitHub Copilot Student access is not an OpenAI API subscription.
 */
import {buildAuditData,reconcileBenefits,auditBrief} from '../audit/core.mjs';
import {buildServiceData,summarizeService,serviceBrief} from '../service/core.mjs';
const topic=process.argv.includes('--service')?'service':'audit';
const summary=topic==='audit'?auditBrief(reconcileBenefits(buildAuditData())):serviceBrief(summarizeService(buildServiceData()));
const heading='# '+(topic==='audit'?'Synthetic Benefits Reconciliation':'Synthetic Benefits Service')+' | Management Brief\n\n';
function fallback(){
  if(topic==='audit')return heading+
    '**Method:** Deterministic control summary; this is not AI-generated.\n\n'+
    '## Findings\n- Analyzed '+summary.records+' fabricated HRIS records.\n- Flagged '+summary.exceptions+
    ' exceptions, '+summary.highRisk+' high-risk.\n- By issue type: '+
    Object.entries(summary.types).map(([name,n])=>name+' ('+n+')').join(', ')+'.\n\n'+
    '## Suggested next actions\n1. Prioritize coverage and missing enrollment confirmation.\n'+
    '2. Ask Payroll, Finance and the insurer to review duplicate charges and premiums.\n'+
    '3. Record source evidence and a manager review before closure.\n\n'+
    '**Limitations:** All data and policy rules are fabricated. No financial savings validated.\n';
  return heading+'**Method:** Deterministic control summary; this is not AI-generated.\n\n'+
    '## Findings\n- '+summary.tickets+' fabricated tickets, '+summary.open+' open and '+summary.closed+' closed.\n'+
    '- '+summary.slaBreaches+' illustrative SLA violations and '+summary.atRisk+' at-risk cases.\n'+
    '- '+summary.onboardingComplete+' of '+summary.onboardingTotal+' simulated new joiners completed all checkpoints.\n\n'+
    '## Suggested next actions\n1. Review urgent coverage and overdue vendor cases.\n'+
    '2. Reconcile unresolved billing inquiries with insurer and Payroll.\n'+
    '3. Follow up with assigned owners of incomplete onboarding steps.\n\n'+
    '**Limitations:** No live service operations, production SLAs or real beneficiaries.\n';
}
const instructions='You are an Employee Benefits Analyst writing a concise, professional manager memo. Use only synthetic AGGREGATE statistics. Identify three risks, three actions, and important limitations. Never invent policy terms, real cost savings, tasks completed, employee identities, or evidence of company employment. State that all inputs are fictional and model output must be reviewed by a human. 400 words maximum.';
async function main(){
 if(!process.env.OPENAI_API_KEY){
   process.stdout.write(fallback());
   console.error('OPENAI_API_KEY unavailable: used deterministic briefing instead of LLM output.');
   return;
 }
 const response=await fetch('https://api.openai.com/v1/responses',{
  method:'POST',
  headers:{'Content-Type':'application/json','Authorization':'Bearer '+process.env.OPENAI_API_KEY},
  body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',
    input:[{role:'system',content:instructions},{role:'user',content:JSON.stringify(summary)}],
    max_output_tokens:850})
 });
 if(!response.ok)throw Error('Model API request returned HTTP '+response.status);
 const obj=await response.json();
 const output=(obj.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n').trim();
 if(!output)throw Error('Model response did not contain text.');
 process.stdout.write(heading+'**Method:** Model-assisted DRAFT. Human validation required.\n\n'+output+'\n');
}
main().catch(e=>{console.error('Failed to prepare brief: '+e.message);process.exitCode=1;});
