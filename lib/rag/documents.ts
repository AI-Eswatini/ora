// Fictional SME lending policy docs for the RAG demo, split into paragraphs
// at retrieval time by lib/rag/store.ts.

export type KnowledgeDocument = {
  id: string;
  title: string;
  text: string;
};

export const knowledgeBase: KnowledgeDocument[] = [
  {
    id: "credit-policy",
    title: "SME Lending Policy: Approval Limits & Thresholds",
    text: `Loan officers may approve SME facilities up to R2,000,000 at Risk Tier A or B without escalation to the credit committee. Facilities above R2,000,000, or any facility to a Risk Tier C or D applicant, require a full credit memo and committee sign-off regardless of amount.

The minimum acceptable Repayment Coverage Ratio -- how many times over the business's annual profit covers its annual loan repayments -- is 1.25x for term loans and 1.10x for working capital facilities. Applicants below these thresholds may only be approved with additional collateral cover of at least 1.5x the facility amount, or a personal guarantee from a director with verifiable net worth exceeding the facility amount.

Maximum loan-to-value (LTV) on property-secured facilities is 70% for commercial property and 60% for residential property pledged as collateral. Movable asset collateral (equipment, vehicles, inventory) is capped at 50% LTV due to depreciation and liquidation risk.

Businesses trading for less than 12 months are classified as start-ups (Risk Tier D) and are not eligible for unsecured facilities. Start-ups require full collateral cover and a detailed cash flow forecast covering at least 24 months.`,
  },
  {
    id: "industry-risk-ratings",
    title: "Industry Risk Ratings: Sector Notes",
    text: `Hospitality and restaurants carry an elevated risk rating (Risk Tier C) due to thin margins, high fixed costs, and sensitivity to discretionary consumer spending. Seasonal revenue volatility should be modelled explicitly rather than averaged across the year.

Construction and civil engineering firms are rated medium-high risk (Risk Tier C) owing to project-based cash flow, exposure to payment delays from main contractors, and working capital strain during multi-month builds. Underwriters should review the order book and retention clauses in active contracts.

Retail trade is rated medium risk (Risk Tier B). Independent retailers competing with larger chains face margin compression; underwriters should assess footfall trends and lease terms, particularly renewal dates within the facility tenor.

Technology and software businesses are rated medium-low risk (Risk Tier B) when revenue is subscription-based and recurring, but medium-high risk (Risk Tier C) when revenue is project or contract based with customer concentration above 30% in a single client.

Agriculture and agri-processing is rated medium risk (Risk Tier B) with high seasonality; facilities should be structured around harvest cycles rather than flat monthly repayments. Weather and commodity price exposure should be noted in the credit memo.

Manufacturing is rated medium risk (Risk Tier B) overall, trending lower for businesses with diversified customer bases and export contracts, and higher (Risk Tier C) for single-customer or single-input-dependent operations.

No sector starts at Risk Tier A -- that rating is earned by financial performance (strong repayment coverage, low leverage), not assigned by industry alone.`,
  },
  {
    id: "financial-ratio-benchmarks",
    title: "Financial Ratio Benchmarks by Category",
    text: `Current ratio (current assets / current liabilities) below 1.0 indicates the business may struggle to meet short-term obligations and should be flagged for further liquidity review. A current ratio between 1.2 and 2.0 is considered healthy for most SME sectors; ratios above 3.0 may indicate excess idle working capital.

Debt-to-equity ratio above 3.0 is considered high leverage for an SME and warrants closer inspection of repayment capacity and shareholder support. A debt-to-equity ratio below 1.0 suggests conservative gearing and stronger capacity to absorb an additional facility.

Gross margin benchmarks vary significantly by sector: retail typically runs 20-35%, hospitality 55-70%, professional services 60-80%, construction 15-25%, and manufacturing 25-40%. A gross margin materially below sector benchmark should prompt a question about pricing power or input cost pressure.

The Repayment Coverage Ratio is calculated as operating profit divided by total annual loan repayments (principal plus interest) for the period. In plain terms: how many times over does the business's profit cover what it owes on its debt this year? This is the single most important ratio for repayment capacity assessment, more so than profitability alone, since a profitable business can still fail to service debt if cash conversion is poor.`,
  },
  {
    id: "collateral-security-policy",
    title: "Collateral & Security Policy",
    text: `Acceptable primary collateral types, in order of preference, are: registered commercial or residential property, listed marketable securities, cession of a fixed deposit, and general notarial bonds over movable business assets. Unregistered or informal property may not be used as primary security.

Accounts receivable financing requires a debtors' book aged analysis; only receivables less than 60 days outstanding, and from debtors with no material dispute history, may be counted toward available security.

Personal guarantees from directors are considered supporting rather than primary security. A personal guarantee does not reduce the required collateral cover; it is an additional layer applied on top of the collateral policy for the relevant risk tier.

Insurance is mandatory on all pledged movable assets for the full facility tenor, with the bank noted as first loss payee. Facilities secured by uninsured assets must not be disbursed.`,
  },
  {
    id: "early-warning-signs",
    title: "Portfolio Monitoring: Early Warning Signs",
    text: `Three or more consecutive months of declining bank account turnover relative to the trailing 12-month average is an early warning sign and should trigger a portfolio review, even if repayments remain current.

Unauthorized or repeated excess over an approved overdraft facility, especially near month-end or payroll dates, often precedes a broader liquidity event and should be investigated promptly rather than resolved silently.

A sudden change in the business's primary banking relationship, request to redirect debit order collection dates, or repeated requests for repayment holidays are behavioral indicators that should be escalated for review regardless of the stated reason.

Deterioration in trade reference or credit bureau data, such as new judgments, increased days-payable-outstanding to suppliers, or a drop in credit score of more than 50 points within a quarter, should trigger a full facility review ahead of the next scheduled annual review.`,
  },
];
