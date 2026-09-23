import { tool } from "ai";
import { z } from "zod";
import { embedQuery, rerankCandidates, retrieveCandidates } from "@/lib/rag/store";
import { postToSlack } from "@/lib/slack";

export const searchPolicy = tool({
  description:
    "Search ORA's SME lending policy (approval limits, repayment coverage thresholds, industry risk ratings, ratio benchmarks, collateral rules) for passages relevant to a question. Use this before citing any threshold, limit, or risk tier -- never rely on memory for policy numbers.",
  inputSchema: z.object({
    query: z.string().describe("A focused question or topic, e.g. 'minimum repayment coverage for term loans' or 'hospitality industry risk tier'."),
  }),
  execute: async function* ({ query }) {
    yield { stage: "embedding" as const, query };

    const { embedding, tokens } = await embedQuery(query);

    const candidates = await retrieveCandidates(embedding);
    yield {
      stage: "retrieved" as const,
      query,
      queryEmbeddingTokens: tokens,
      candidates: candidates.map((c) => ({
        source: c.docTitle,
        relevance: Number(c.score.toFixed(3)),
      })),
    };

    const passages = await rerankCandidates(query, candidates);
    yield {
      stage: "done" as const,
      query,
      queryEmbeddingTokens: tokens,
      passages: passages.map((p) => ({
        source: p.docTitle,
        text: p.text,
        relevance: Number(p.score.toFixed(3)),
      })),
    };
  },
});

export const checkAffordability = tool({
  description:
    "Work out whether an applicant can afford the loan from their financial figures: their profit margin, and their repayment coverage ratio -- how many times over their profit covers their annual loan repayments. Pure arithmetic -- it does not judge the numbers against policy; use searchPolicy for the thresholds to compare them against.",
  inputSchema: z.object({
    revenue: z.number().describe("Annual revenue"),
    grossProfit: z.number().describe("Annual gross profit (revenue minus cost of sales)"),
    operatingProfit: z.number().describe("Annual profit before interest and tax (EBITDA)"),
    annualLoanRepayments: z.number().describe("Total annual loan repayments across all debt -- principal plus interest"),
    facilityType: z.enum(["term_loan", "working_capital"]).describe("The type of loan being assessed, since the minimum repayment coverage differs"),
  }),
  execute: async (input) => ({
    grossMarginPct: Number(((input.grossProfit / input.revenue) * 100).toFixed(1)),
    repaymentCoverage: Number((input.operatingProfit / input.annualLoanRepayments).toFixed(2)),
    facilityType: input.facilityType,
  }),
});

export const recordDecision = tool({
  description:
    "Record ORA's recommended underwriting decision (approve, decline, or refer to committee) once the ratios have been checked against policy. This is a sensitive, final action and requires loan officer approval before it takes effect.",
  inputSchema: z.object({
    decision: z.enum(["approve", "decline", "refer_to_committee"]),
    facilityAmount: z.number().optional().describe("Recommended facility amount, if approving"),
    rationale: z.string().describe("Short rationale citing the ratios calculated and the policy checked"),
  }),
  execute: async (input) => ({
    ...input,
    recordedAt: new Date().toISOString(),
  }),
});

export const notifyLoanDecision = tool({
  description:
    "Post ORA's recorded decision to the #loan-approvals Slack channel. Call this for every decision type -- approve, decline, and refer_to_committee alike -- not just approvals; the whole point is a visible record of every outcome. Only call it after recordDecision has been called and the loan officer has approved it, never as a substitute for that step.",
  inputSchema: z.object({
    applicantName: z.string().describe("The SME applicant or business name"),
    decision: z.enum(["approve", "decline", "refer_to_committee"]),
    facilityAmount: z.number().optional().describe("Recommended facility amount, if approving"),
    rationale: z.string().describe("Short rationale citing the ratios calculated and the policy checked"),
  }),
  execute: async (input) => {
    const decisionLabel: Record<typeof input.decision, string> = {
      approve: ":white_check_mark: Approved",
      decline: ":x: Declined",
      refer_to_committee: ":mag: Referred to committee",
    };

    const lines = [
      `*${decisionLabel[input.decision]}* -- ${input.applicantName}`,
      input.facilityAmount !== undefined
        ? `*Facility amount:* ${input.facilityAmount.toLocaleString()}`
        : null,
      `*Rationale:* ${input.rationale}`,
    ].filter((line): line is string => line !== null);

    const { channel, ts } = await postToSlack({ text: lines.join("\n") });
    return { channel, ts, postedAt: new Date().toISOString() };
  },
});

export const oraTools = {
  searchPolicy,
  checkAffordability,
  recordDecision,
  notifyLoanDecision,
};
