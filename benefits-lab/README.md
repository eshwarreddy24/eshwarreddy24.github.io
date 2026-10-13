# BenefitsOps Lab
### Two interactive operational projects for a Global Benefits Analyst career-transition portfolio

**Portfolio:** [BenefitsOps Lab](./) · [Project 1: Enrollment & Billing Audit](./audit/) · [Project 2: Benefits Service Operations](./service/)

> **Scope and honesty:** This is an independent, educational simulation. Every employee, vendor, invoice, policy assumption, ticket, onboarding event, and result is fictional. The projects are not affiliated with GitLab or an insurance provider. There is no real Workday/insurer integration, no prior benefits employment claimed, and no verified financial savings.

## Portfolio overview

| Project | Business challenge | Functional demo | Analyst skills |
|---|---|---|---|
| **01: Global Benefits Enrollment & Billing Reconciliation** | HRIS, insurer enrollment and invoice mismatches | Run audit, search exception queue, drill into owner/action, separate INR & GBP, export findings | Eligibility, enrollment, vendor reconciliation, audits, finance controls |
| **02: Employee Benefits Service & Onboarding Operations** | Delayed inquiries, unclear vendor handoffs and onboarding gaps | Prioritize tickets, monitor SLA risks, investigate cases, generate controlled draft, track onboarding | Employee support, SLA analytics, vendors/Payroll, process documentation |

Both projects are built with native HTML/CSS, JavaScript ES modules, a deterministic synthetic dataset, Node built-in tests and Mermaid diagrams. They require no server or paid service to display.

## Project 1: Process flow

~~~mermaid
flowchart LR
    A[Mock HRIS master] --> D[Eligibility checks]
    B[Mock insurer roster] --> E[Member and plan checks]
    C[Mock monthly invoices] --> F[Premium and duplicate checks]
    D --> G[Evidence-linked exception log]
    E --> G
    F --> G
    G --> H[Benefits / Vendor / Finance review]
    H --> I[Exception export and manager brief]
~~~

## Project 2: Process flow

~~~mermaid
flowchart LR
    A[Mock employee inquiry] --> B[Category and urgency classification]
    B --> C[Owner assignment and SLA]
    C --> D{At risk or breached?}
    D -->|Yes| E[Escalate vendor / Payroll / Benefits]
    D -->|No| F[Policy and evidence review]
    E --> F
    F --> G[Human-reviewed employee response]
    G --> H[Service reporting]
    I[Mock new joiner] --> J[Four onboarding checkpoints]
    J --> H
~~~

## Folder structure

~~~text
benefits-lab/
├── index.html                   Portfolio homepage
├── README.md                    This guide
├── assets/
│   └── style.css               Consistent responsive layout
├── audit/
│   ├── index.html               Global reconciliation dashboard
│   ├── app.mjs                   Interactive controls and CSV export
│   ├── core.mjs                  Deterministic fixtures + audit rules
│   └── README.md                Project 1 logic and flowchart
├── service/
│   ├── index.html               Support and onboarding dashboard
│   ├── app.mjs                   Ticket UI, draft replies and export
│   ├── core.mjs                  SLA and onboarding engine
│   └── README.md                Project 2 logic and flowchart
├── tests/
│   ├── audit.test.mjs           Reconciliation tests
│   └── service.test.mjs         Service workflow tests
├── tools/
│   └── ai_brief.mjs             Optional anonymized LLM manager brief
└── .github/
    └── copilot-instructions.md  VS Code workspace guidance
~~~

A CI workflow is installed in the parent repository under .github/workflows/benefits-lab-tests.yml.

## Run locally

Requirements: any modern browser, Python 3 for an HTTP server, and Node.js 20+ for optional tests and AI CLI.

~~~sh
git clone https://github.com/eshwarreddy24/eshwarreddy24.github.io.git
cd eshwarreddy24.github.io/benefits-lab
python -m http.server 8000
# Open http://localhost:8000/
~~~

In another terminal:

~~~sh
node --test tests/*.test.mjs
node tools/ai_brief.mjs --audit
node tools/ai_brief.mjs --service
~~~

Use a local HTTP server; browser ES modules may not load from file:// directly.

## AI automation and GitHub Copilot

The browser dashboards generate only aggregate, synthetic metrics for an AI-assisted manager brief. The service reply generator is a safe deterministic template system, **not** a model-generated answer. Neither dashboard transmits data externally.

The optional command-line tool uses a deterministic fallback if no API key is configured. To call a model from your own computer:

~~~sh
export OPENAI_API_KEY="your-own-secret-key"
node tools/ai_brief.mjs --audit
node tools/ai_brief.mjs --service
~~~

Do not commit your API key. The model API may charge separately. GitHub Copilot Student access does not supply an OpenAI API key. To use your **existing GitHub Copilot plan instead**, open the benefits-lab folder in VS Code, read .github/copilot-instructions.md, and paste the dashboard-generated aggregate manager-brief prompt into Copilot Chat.

**Controls:** no personal health or payroll data in prompts, no real PII in public repositories, no automatic employee messages, no promises of coverage, and mandatory human review before communication.

## Quality and constraints

- Synthetic-only deterministic records; repeatable results and automated tests.
- Pure calculation modules separated from the user interface.
- Decision-oriented exception routing with suggested responsible teams.
- Defensive CSV encoding to reduce spreadsheet formula injection risk.
- INR and GBP kept in separate totals. No meaningless cross-currency aggregation.
- Mobile-friendly layouts, labelled controls, readable typography and download-ready CSV exports.
- Explicit limitations: not a real HRIS, no vendor integrations, no authenticated case storage, no real insurer policy validation, and sample SLA windows use elapsed hours rather than business hours.

## Five-minute walkthrough for hiring managers

1. State the business problem: a benefits team reconciles employee eligibility, insurer coverage and invoice payments.
2. Show Project 1: run the audit, inspect a missing enrollment and duplicate charge, explain evidence and escalation.
3. Show Project 2: filter breached SLAs, demonstrate an employee communication draft, and inspect onboarding completion.
4. Explain where a Senior Benefits Analyst or local plan expert must review decisions.
5. Demonstrate the anonymized AI prompt and transparent limitations.

## Resume-safe project statement

"Developed two independent synthetic Benefits Operations case studies covering dual-country enrollment and invoice reconciliation, exception reporting, SLA monitoring, onboarding tracking, employee communication controls, and privacy-conscious AI-assisted summaries."

## Next improvements

Include a spreadsheet companion with XLOOKUP/pivot-table equivalents, a reviewed country plan versioning matrix, and user-imported **synthetic-only** CSV support. No employee-sensitive information should be placed in a public GitHub repository.
