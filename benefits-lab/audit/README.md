# Project 01 | Global Benefits Enrollment & Invoice Reconciliation
> **Independent simulation for a Benefits Analyst portfolio.** All people, effective dates, policy rules, and premium rates are fabricated. Nothing represents an employer, insurer, or legal determination.

[Launch interactive audit](./) · [Open portfolio hub](../) · [Source code](./core.mjs)

## The business problem
HRIS, benefits vendor enrollment, and invoice files frequently disagree. A Benefits Analyst must protect coverage accuracy, investigate exceptions, involve Payroll/Finance and the vendor, and keep country currencies and rules separate.

## What is implemented
- A **deterministic 600-employee synthetic HRIS master** covering India and UK.
- Fabricated insurer enrollment and billing records, including planted errors.
- Checks for **missing enrollment, post-exit coverage, dependent eligibility, plan mismatch, unknown vendor members, invoice duplicates, premium variances**, and mismatched invoice country/currency.
- A searchable exception workbench, recommended owners and next actions, country-specific cost comparison, CSV export, and AI-ready aggregate management brief.
- Independent unit tests runnable in Node. No data is sent to a remote server by the browser.

## Operational flow
~~~mermaid
flowchart TD
  A[Fabricated HRIS employee master] --> D{Eligibility and exit-date control}
  B[Fabricated vendor enrollments] --> E[Employee ID and plan match]
  C[Fabricated September invoices] --> F[Charge amount and duplicate check]
  D --> G[Exception register]
  E --> G
  F --> G
  G --> H{Severity and owner}
  H --> I[Benefits / Vendor: coverage correction]
  H --> J[Finance / Payroll: billing validation]
  I --> K[Manager reviews closure evidence]
  J --> K
  K --> L[Audit report and CSV export]
~~~

## Data dictionary
| Source | Representative fields | Control |
|---|---|---|
| HRIS employees | id, country, plan, status, hireDate, exitDate, dependentAge | eligibility |
| Vendor | employeeId, country, plan, effectiveDate | enrollment matching |
| Invoice | invoiceId, employeeId, country, amount, currency, period | duplication and variance |
| Policy model | country, currency, Base/Plus rates, dependent age threshold | illustrative only |

The mock rates are India Base INR 1,800 / Plus INR 3,100 and UK Base GBP 48 / Plus GBP 79. They are **arbitrary testing constants, not market rates or actual plan terms**. September 2026 is the sole simulated billing month. Positive differences in billed vs modeled expected are not recoverable savings without investigation.

## Control design and decision boundaries
1. Resolve missing enrollment as high priority and validate coverage effective dates with the vendor.
2. Flag post-exit enrollment for review, not automatic cancellation: plan conditions may provide continuation.
3. Ask for approved plan elections before correcting plan mismatches.
4. Verify country-specific dependent criteria with actual plan documentation before any eligibility decision.
5. Invoices are compared by individual currency. Never add INR to GBP.
6. Every exception needs a named owner, source evidence, action, and closure verification.

## Demonstration
1. Open index.html in a static HTTP server (ES module loading requires HTTP).
2. Select **Run reconciliation**, filter a country or exception type, and click an issue row.
3. Export the findings CSV.
4. Select **Build AI-ready brief**. Only aggregate statistics appear in the prompt.

## Run locally
From the benefits-lab folder:
~~~sh
python -m http.server 8000
# Open http://localhost:8000/audit/
node --test tests/*.test.mjs
~~~

## Portfolio claims you can make
"I built and tested a synthetic two-country benefits enrollment and invoice reconciliation model, including audit controls, evidence-linked exceptions and a manager review workflow." Do **not** claim to have administered 600 real employees' benefits, produced verified cost savings, or used actual Workday data.
