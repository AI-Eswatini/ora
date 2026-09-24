/**
 * Two-stage retrieval over a small in-memory knowledge base. Stage 1
 * (bi-encoder) is fast and casts a wide net -- recall over precision. Stage 2
 * (cross-encoder rerank) is slower and narrows that net to only the passages
 * a model would actually see -- precision over recall.
 *
 * Run: npm run demo:rag
 */
import { cosineSimilarity, embed, embedMany, rerank } from "ai";
import { config } from "dotenv";
import { voyage } from "voyage-ai-provider";

config();

const embeddingModel = voyage.embeddingModel("voyage-4-lite");
const rerankingModel = voyage.reranking("rerank-2.5-lite");

// Fictional lending-policy passages. Each entry is already one retrievable chunk.
const passages = [
  {
    title: "Approval limits",
    text: "Loan officers may approve SME facilities up to R2,000,000 at Risk Tier A or B without escalation to the credit committee. Facilities above R2,000,000, or any facility to a Risk Tier C or D applicant, require committee sign-off.",
  },
  {
    title: "Repayment coverage minimums",
    text: "The minimum acceptable Repayment Coverage Ratio -- how many times over the business's annual profit covers its annual loan repayments -- is 1.25x for term loans and 1.10x for working capital facilities.",
  },
  {
    title: "Repayment coverage definition",
    text: "The Repayment Coverage Ratio is operating profit divided by total annual loan repayments (principal plus interest). It shows how many times over the business's profit covers what it owes on its debt this year.",
  },
  {
    title: "Loan-to-value",
    text: "Maximum loan-to-value on property-secured facilities is 70% for commercial property and 60% for residential property. Movable asset collateral is capped at 50% due to depreciation and liquidation risk.",
  },
  {
    title: "Start-ups",
    text: "Businesses trading for less than 12 months are classified as start-ups (Risk Tier D) and are not eligible for unsecured facilities.",
  },
  {
    title: "Hospitality risk",
    text: "Hospitality and restaurants carry an elevated risk rating (Risk Tier C) due to thin margins, high fixed costs, and sensitivity to discretionary consumer spending.",
  },
  {
    title: "Gross margin benchmarks",
    text: "Gross margin varies by sector: retail typically runs 20-35%, hospitality 55-70%, professional services 60-80%, construction 15-25%, and manufacturing 25-40%.",
  },
  {
    title: "Current ratio",
    text: "A current ratio below 1.0 indicates the business may struggle to meet short-term obligations and should be flagged for further liquidity review.",
  },
  {
    title: "Collateral insurance",
    text: "Insurance is mandatory on all pledged movable assets for the full facility tenor, with the bank noted as first loss payee.",
  },
  {
    title: "Early warning signs",
    text: "Three or more consecutive months of declining bank account turnover relative to the trailing 12-month average should trigger a portfolio review, even if repayments remain current.",
  },
];

const POOL_SIZE = 6;
const TOP_N = 3;

async function main() {
  const query = "What DSCR do we need for a working capital facility?";
  console.log(`Query: "${query}"\n`);

  const { embeddings: passageEmbeddings } = await embedMany({
    model: embeddingModel,
    values: passages.map((passage) => passage.text),
    providerOptions: { voyage: { inputType: "document" } },
  });

  const { embedding: queryEmbedding, usage } = await embed({
    model: embeddingModel,
    value: query,
    providerOptions: { voyage: { inputType: "query" } },
  });
  console.log(`Embedded ${passages.length} passages and the query (${usage.tokens} query tokens)\n`);

  const candidates = passages
    .map((passage, i) => ({
      ...passage,
      score: cosineSimilarity(queryEmbedding, passageEmbeddings[i]),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, POOL_SIZE);

  console.log(`Stage 1 -- bi-encoder retrieval (top ${POOL_SIZE} of ${passages.length}, ranked by cosine similarity):`);
  for (const [i, c] of candidates.entries()) {
    console.log(`  ${i + 1}. [${c.score.toFixed(3)}] ${c.title}`);
  }

  const { ranking } = await rerank({
    model: rerankingModel,
    query,
    documents: candidates.map((c) => c.text),
    topN: TOP_N,
  });

  console.log(`\nStage 2 -- cross-encoder rerank (narrowed to the ${TOP_N} the model would actually see):`);
  for (const [i, { originalIndex, score }] of ranking.entries()) {
    const c = candidates[originalIndex];
    console.log(`  ${i + 1}. [${score.toFixed(3)}] ${c.title}`);
    console.log(`     "${c.text.slice(0, 140)}..."`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
