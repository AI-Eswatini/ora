import { tool } from "ai";
import { z } from "zod";
import { embedQuery, rerankCandidates, retrieveCandidates } from "@/lib/rag/store";
import { isSlackConfigured, postToSlack } from "@/lib/slack";

export const searchPolicy = tool({
  description:
    "Search ORA's SME lending policy (approval limits, repayment coverage thresholds, industry risk ratings, ratio benchmarks, collateral rules) for passages relevant to a question. Use this before citing any threshold, limit, or risk tier -- never rely on memory for policy numbers.",
  inputSchema: z.object({
    query: z.string().describe("A focused question or topic, e.g. 'minimum repayment coverage for term loans' or 'hospitality industry risk tier'."),
  }),
  execute: async function* ({ query }) {
    yield { stage: "embedding" as const, query };

    const { embedding: queryEmbedding, tokens: queryEmbeddingTokens } = await embedQuery(query);

    const candidates = await retrieveCandidates(queryEmbedding);
    yield {
      stage: "retrieved" as const,
      query,
      queryEmbeddingTokens,
      candidates: candidates.map((candidate) => ({
        source: candidate.docTitle,
        relevance: Number(candidate.score.toFixed(3)),
      })),
    };

    const rerankedPassages = await rerankCandidates(query, candidates);
    yield {
      stage: "done" as const,
      query,
      queryEmbeddingTokens,
      passages: rerankedPassages.map((passage) => ({
        source: passage.docTitle,
        text: passage.text,
        relevance: Number(passage.score.toFixed(3)),
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
  execute: async ({ revenue, grossProfit, operatingProfit, annualLoanRepayments, facilityType }) => {
    // Gross margin: the percentage of revenue left after the cost of sales
    const grossMarginPct = Number(((grossProfit / revenue) * 100).toFixed(1));

    // Repayment coverage: how many times operating profit covers the year's loan repayments
    const repaymentCoverage = Number((operatingProfit / annualLoanRepayments).toFixed(2));

    return { grossMarginPct, repaymentCoverage, facilityType };
  },
});

export const recordDecision = tool({
  description:
    "Record ORA's recommended underwriting decision (approve, decline, or refer to committee) once the ratios have been checked against policy. This is a sensitive, final action and requires loan officer approval before it takes effect.",
  inputSchema: z.object({
    decision: z.enum(["approve", "decline", "refer_to_committee"]),
    facilityAmount: z.number().optional().describe("Recommended facility amount, if approving"),
    rationale: z.string().describe("Short rationale citing the ratios calculated and the policy checked"),
  }),
  execute: async ({ decision, facilityAmount, rationale }) => {
    // await db.query("INSERT INTO loan_decisions (decision, facility_amount, rationale) VALUES ($1, $2, $3)", [decision, facilityAmount, rationale]);

    return { decision, facilityAmount, rationale, recordedAt: new Date().toISOString() };
  },
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
  execute: async ({ applicantName, decision, facilityAmount, rationale }) => {
    const decisionLabel: Record<typeof decision, string> = {
      approve: ":white_check_mark: Approved",
      decline: ":x: Declined",
      refer_to_committee: ":mag: Referred to committee",
    };

    const slackMessageLines = [
      `*${decisionLabel[decision]}* -- ${applicantName}`,
      facilityAmount !== undefined
        ? `*Facility amount:* ${facilityAmount.toLocaleString()}`
        : null,
      `*Rationale:* ${rationale}`,
    ].filter((messageLine): messageLine is string => messageLine !== null);

    const { channel: slackChannel, ts: slackMessageTimestamp } = await postToSlack({
      text: slackMessageLines.join("\n"),
    });
    return { channel: slackChannel, ts: slackMessageTimestamp, postedAt: new Date().toISOString() };
  },
});

const coreTools = {
  searchPolicy,
  checkAffordability,
  recordDecision,
};

// Slack is optional -- without SLACK_BOT_TOKEN the tool isn't registered, so the agent never tries to call it.
export const oraTools = isSlackConfigured()
  ? { ...coreTools, notifyLoanDecision }
  : coreTools;
