// Predefined applicant scenarios shown in the sidebar. Clicking one opens the
// full application in a modal; "Use Ora" sends `prompt` to the agent.
// Add or edit entries here -- no UI changes needed.
//
// `document` uses "## " lines as section headings (rendered by DocumentModal).
// Keep its figures consistent with `prompt`, which carries what the tools need.

export type SampleApplication = {
  id: string;
  business: string;
  blurb: string;
  prompt: string;
  document: string;
};

export const sampleApplications: SampleApplication[] = [
  {
    id: "kagiso",
    business: "Kagiso Retail Traders",
    blurb: "Retail · 3 yrs trading",
    prompt:
      "Kagiso Retail Traders, a retail business trading for 3 years, wants a R1,200,000 term loan. Revenue R2,000,000, gross profit R700,000, operating profit R450,000, annual loan repayments R300,000. Should we approve it?",
    document: `Application ref: SME-2026-0417
Date received: 2 September 2026
Branch: Soweto Business Centre
Relationship manager: N. Dlamini

## Applicant
- Registered name: Kagiso Retail Traders (Pty) Ltd
- Registration number: 2023/184552/07
- Industry: Retail trade -- general merchandise and groceries
- Trading since: August 2023 (3 years)
- Premises: Leased, 420 m² at Maponya Mall precinct, Soweto (lease expires July 2029)
- Employees: 14 full-time, 6 part-time
- Banking with us since: September 2023

## Directors & ownership
- Kagiso Mokoena -- Managing Director, 70% shareholding, 12 years' prior retail management experience
- Lerato Mokoena -- Financial Director, 30% shareholding, qualified bookkeeper (ICB)
- Credit bureau: both directors clear, no judgments or defaults. Director net worth (declared): R2,300,000.

## Facility requested
- Type: Term loan
- Amount: R1,200,000
- Tenor: 84 months
- Indicative rate: Prime + 2.0% (13.25%)
- Estimated instalment: R22,000 per month (R264,000 per year)

## Purpose of funds
- Second store fit-out in Protea Glen: R650,000
- Opening stock for second store: R350,000
- POS and inventory system upgrade across both stores: R200,000

## Financial summary (FY ending Feb 2026, management accounts)
- Revenue: R2,000,000
- Cost of sales: R1,300,000
- Gross profit: R700,000 (35% margin)
- Operating expenses: R250,000
- Operating profit (EBITDA): R450,000
- Prior year revenue: R1,720,000 (16% growth year on year)

## Existing debt
- Vehicle finance (delivery van): R3,000 per month, 22 months remaining
- Total annual loan repayments including the proposed loan: R300,000

## Collateral offered
- General notarial bond over stock and store equipment (estimated value R900,000)
- Cession of debtors book
- Limited suretyship from Kagiso Mokoena for R600,000

## Bank conduct
- Average monthly credit turnover: R168,000
- No returned debit orders or excesses in the last 12 months

## Relationship manager notes
Strong local footfall and a consistent growth trend. The main risk is execution on the second store: new-store revenue is forecast to reach break-even in month 9. The existing lease runs beyond most of the loan tenor, but the new Protea Glen lease is still under negotiation.`,
  },
  {
    id: "delta",
    business: "Delta Construction",
    blurb: "Construction · 5 yrs trading",
    prompt:
      "Delta Construction, a construction business trading for 5 years, wants a R1,800,000 term loan. Revenue R3,000,000, gross profit R900,000, operating profit R500,000, annual loan repayments R400,000. Should we approve it?",
    document: `Application ref: SME-2026-0431
Date received: 9 September 2026
Branch: Midrand Commercial
Relationship manager: P. van Wyk

## Applicant
- Registered name: Delta Construction & Civils CC
- Registration number: 2021/045219/23
- Industry: Construction -- residential and light commercial building
- Trading since: March 2021 (5 years)
- Premises: Owned yard and office, Kya Sand industrial area
- Employees: 22 permanent, 30 to 45 contract labourers depending on the project
- CIDB grading: 5GB
- Banking with us since: March 2021

## Members & ownership
- Sipho Ndlovu -- Member, 60%, civil engineer (Pr Tech Eng)
- Thabo Radebe -- Member, 40%, site and operations manager
- Credit bureau: Sipho Ndlovu clear. Thabo Radebe has one paid-up judgment from 2019 (R38,000, settled).

## Facility requested
- Type: Term loan
- Amount: R1,800,000
- Tenor: 84 months
- Indicative rate: Prime + 2.5% (13.75%)
- Estimated instalment: R33,300 per month (R400,000 per year)

## Purpose of funds
- TLB (tractor-loader-backhoe) and tipper truck: R1,350,000
- Refinance an existing equipment loan with another lender: R450,000

## Financial summary (FY ending Feb 2026, audited)
- Revenue: R3,000,000
- Cost of sales: R2,100,000
- Gross profit: R900,000 (30% margin)
- Operating expenses: R400,000
- Operating profit (EBITDA): R500,000
- Prior year revenue: R3,350,000 (10% decline year on year, a large contract was delayed)

## Existing debt
- Equipment loan with another lender: R450,000 outstanding, to be settled from this facility
- Total annual loan repayments after refinance: R400,000

## Order book & contracts
- Secured order book: R4,100,000 across 3 contracts
- Largest client: Gauteng residential developer, 55% of the order book
- Retentions held by main contractors: R310,000 (10% on two contracts, released on practical completion)
- Average debtor days: 74

## Collateral offered
- Instalment sale agreement over the TLB and tipper (new value R1,350,000)
- Second mortgage bond over the Kya Sand yard (valuation R2,100,000, first bond R900,000 outstanding)
- Joint suretyship from both members

## Bank conduct
- Average monthly credit turnover: R245,000, with large swings between project payments
- Two short-lived excesses on the overdraft in the last 12 months, both cleared within 5 days

## Relationship manager notes
Experienced team with a solid record of delivery. Cash flow is lumpy and tied to project milestones. The concentration on one developer and the year-on-year revenue decline need committee attention. Buying the equipment should cut plant-hire costs by roughly R180,000 a year.`,
  },
  {
    id: "sunrise",
    business: "Sunrise Hospitality",
    blurb: "Hospitality · 6 mo trading",
    prompt:
      "Sunrise Hospitality, a hospitality business trading for 6 months, wants a R500,000 working capital facility. Revenue R1,200,000, gross profit R650,000, operating profit R120,000, annual loan repayments R150,000. Should we approve it?",
    document: `Application ref: SME-2026-0445
Date received: 15 September 2026
Branch: Durban North
Relationship manager: A. Pillay

## Applicant
- Registered name: Sunrise Hospitality (Pty) Ltd
- Registration number: 2025/611208/07
- Industry: Hospitality -- 12-room guesthouse with a breakfast restaurant
- Trading since: March 2026 (6 months)
- Premises: Leased property in Umhlanga, 5-year lease (expires February 2031)
- Employees: 9 full-time, 4 seasonal
- Banking with us since: January 2026

## Directors & ownership
- Naledi Khumalo -- Director, 100% shareholding, 8 years as a hotel operations manager
- Credit bureau: clear. Director net worth (declared): R850,000.

## Facility requested
- Type: Working capital facility (revolving)
- Amount: R500,000
- Indicative rate: Prime + 3.5% (14.75%)
- Estimated servicing: R12,500 per month (R150,000 per year)

## Purpose of funds
- Bridge low-season cash flow from May to August: R300,000
- Pre-purchase of linen, consumables and restaurant stock before peak season: R120,000
- Online booking platform and marketing: R80,000

## Financial summary (annualised from 6 months of management accounts)
- Revenue: R1,200,000
- Cost of sales: R550,000
- Gross profit: R650,000 (54% margin)
- Operating expenses: R530,000
- Operating profit (EBITDA): R120,000
- Average occupancy: 61% (peak 88% in April, low 34% in June)

## Existing debt
- None
- Total annual loan repayments including the proposed facility: R150,000

## Cash flow forecast
- A 12-month forecast is attached. No 24-month forecast has been provided yet.
- The forecast shows a cash shortfall of R260,000 in the winter months without this facility.

## Collateral offered
- Cession of a unit trust investment held by the director (current value R200,000)
- Unlimited suretyship from Naledi Khumalo
- No property collateral available (premises are leased)

## Bank conduct
- Average monthly credit turnover: R96,000
- One returned debit order in June 2026 (supplier payment, re-presented successfully)

## Relationship manager notes
A capable operator with good guest reviews (4.6/5 across booking platforms). Too early for a meaningful trading history. The business is highly seasonal, and the collateral on offer covers well under half of the facility.`,
  },
];
