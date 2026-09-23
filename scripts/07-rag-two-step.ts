/**
 * The real two-stage retrieval ORA's searchPolicy tool uses, run standalone
 * against the actual knowledge base. Stage 1 (bi-encoder) is fast and casts
 * a wide net -- recall over precision. Stage 2 (cross-encoder rerank) is
 * slower and narrows that net to only what the model actually sees --
 * precision over recall, and the fix for script 05's anti-pattern.
 *
 * Run: npm run demo:rag
 */
import { embedQuery, retrieveCandidates, rerankCandidates } from "@/lib/rag/store";
import { config } from "dotenv";

config();

async function main() {
  const query = "What DSCR do we need for a working capital facility?";
  console.log(`Query: "${query}"\n`);

  const { embedding, tokens } = await embedQuery(query);
  console.log(`Embedded query (${tokens} tokens)\n`);

  const candidates = await retrieveCandidates(embedding);
  console.log("Stage 1 -- bi-encoder retrieval (broad pool, ranked by cosine similarity):");
  for (const [i, c] of candidates.entries()) {
    console.log(`  ${i + 1}. [${c.score.toFixed(3)}] ${c.docTitle} (chunk ${c.chunkIndex})`);
  }

  const passages = await rerankCandidates(query, candidates);
  console.log("\nStage 2 -- cross-encoder rerank (narrowed to what the model will actually see):");
  for (const [i, p] of passages.entries()) {
    console.log(`  ${i + 1}. [${p.score.toFixed(3)}] ${p.docTitle}`);
    console.log(`     "${p.text.slice(0, 140)}..."`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
