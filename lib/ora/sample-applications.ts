// Predefined applicant scenarios shown in the sidebar as one-click prompts.
// Add or edit entries here -- no UI changes needed.

export type SampleApplication = {
  id: string;
  business: string;
  blurb: string;
  prompt: string;
};

export const sampleApplications: SampleApplication[] = [
  {
    id: "kagiso",
    business: "Kagiso Retail Traders",
    blurb: "Retail · 3 yrs trading",
    prompt:
      "Kagiso Retail Traders, a retail business trading for 3 years, wants a R1,200,000 term loan. Revenue R2,000,000, gross profit R700,000, operating profit R450,000, annual loan repayments R300,000. Should we approve it?",
  },
  {
    id: "delta",
    business: "Delta Construction",
    blurb: "Construction · 5 yrs trading",
    prompt:
      "Delta Construction, a construction business trading for 5 years, wants a R1,800,000 term loan. Revenue R3,000,000, gross profit R900,000, operating profit R500,000, annual loan repayments R400,000. Should we approve it?",
  },
  {
    id: "sunrise",
    business: "Sunrise Hospitality",
    blurb: "Hospitality · 6 mo trading",
    prompt:
      "Sunrise Hospitality, a hospitality business trading for 6 months, wants a R500,000 working capital facility. Revenue R1,200,000, gross profit R650,000, operating profit R120,000, annual loan repayments R150,000. Should we approve it?",
  },
];
