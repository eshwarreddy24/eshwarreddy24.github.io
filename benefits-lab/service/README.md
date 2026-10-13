# Project 02 | Employee Benefits Service & Onboarding Operations

[Launch dashboard](./) · [Portfolio overview](../) · [Pure triage logic](./core.mjs)

> All 200 tickets, 100 new joiners, SLA values, and employee requests are invented. This is a public educational demonstration, not an operational insurance or HRIS service.

## Business challenge
Employee benefits inquiries need clear ownership, risk-based prioritization, vendor follow-up and accurate explanations. New joiners also require confirmed elections, dependent checks, and insurer enrollment.

## Implemented system
- **200 deterministic fabricated tickets** including claims, eligibility, dependent changes, coverage, premium/billing and onboarding.
- **100 synthetic onboarding records** with four checkpoints: welcome, election, dependent check, vendor confirmation.
- A rules-based triage engine: category to owner, priority to SLA, and deterministic breach/at-risk classification.
- A searchable live workbench, selected-ticket recommendations, templated reply drafting, CSV export, manager AI prompts, and KPI dashboards.
- Clear separation between automated draft creation and human confirmation of actual coverage or benefits.

## Workflow

~~~mermaid
flowchart TD
    A[Employee benefits inquiry] --> B[Categorize and assign priority]
    B --> C{Illustrative response SLA}
    C -->|Critical: 4h| D[Benefits owner escalation]
    C -->|High: 12h| E[Vendor or Payroll coordination]
    C -->|Normal / Low: 48 to 72h| F[Helpdesk triage]
    D --> G[Document action and owner]
    E --> G
    F --> G
    G --> H{Confirmed with policy or vendor?}
    H -->|No| I[Request additional evidence]
    I --> G
    H -->|Yes| J[Human-approved employee response]
    J --> K[Closure and analytics]
    L[New joiner] --> M[Welcome + election + dependent checks]
    M --> N[Vendor confirmation]
    N --> K
~~~

## KPI definitions
| Metric | Operational meaning |
|---|---|
| Open cases | Tickets without a resolved timestamp at fixed simulation as-of date |
| Breached SLA | Open/closed tickets exceeding illustrative elapsed-hour allowance |
| At risk | Open tickets whose elapsed time reaches at least 75% of the allowance |
| Resolution within SLA | Share of closed tickets completed within allowance |
| Onboarding complete | Records where all four synthetic checkpoints are true |

| Priority | Example elapsed-hours allowance |
|---|---:|
| Critical | 4 |
| High | 12 |
| Normal | 48 |
| Low | 72 |

These are made-up training targets, **not GitLab service commitments**. The as-of date is fixed at **2026-10-01 12:00 UTC** for reproducibility, not real-time ticket monitoring.

## Run / validate

~~~sh
cd benefits-lab
python -m http.server 8000
# Open http://localhost:8000/service/
node --test tests/*.test.mjs
~~~

Select a ticket to view its category, owner, SLA, age and suggested next step. Use **Generate template reply** to view a human-review-required draft. Use **Create AI manager brief** to copy a synthetic aggregate prompt into GitHub Copilot Chat.

## AI and ethics
The browser does not use an LLM or transmit any records. A local optional [AI manager briefing script](../tools/ai_brief.mjs) can call an external model using an operator-supplied API key. Only synthetic aggregates are used. GitHub Copilot Student is a development assistant, not equivalent to model API credentials.

Do not represent these sample tickets as real employee service experience. No employee communication, insurance decision or vendor escalation should be automated without documented approvals.
