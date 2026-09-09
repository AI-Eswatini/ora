import { cosineSimilarity, embed, embedMany, rerank } from "ai";
import { voyage } from "voyage-ai-provider";
import { knowledgeBase, type KnowledgeDocument } from "./documents";

const embeddingModel = voyage.embeddingModel("voyage-4-lite");
const rerankingModel = voyage.reranking("rerank-2.5-lite");

type Chunk = {
  docId: string;
  docTitle: string;
  chunkIndex: number;
  text: string;
};

type Index = {
  chunks: Chunk[];
  chunkEmbeddings: number[][];
};

let indexPromise: Promise<Index> | null = null;

function chunkDocument(doc: KnowledgeDocument): Chunk[] {
  return doc.text
    .split("\n\n")
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, chunkIndex) => ({
      docId: doc.id,
      docTitle: doc.title,
      chunkIndex,
      text,
    }));
}

async function buildIndex(): Promise<Index> {
  const chunks = knowledgeBase.flatMap(chunkDocument);

  const { embeddings: chunkEmbeddings } = await embedMany({
    model: embeddingModel,
    values: chunks.map((chunk) => chunk.text),
    providerOptions: { voyage: { inputType: "document" } },
  });

  return { chunks, chunkEmbeddings };
}

function getIndex(): Promise<Index> {
  if (!indexPromise) {
    indexPromise = buildIndex().catch((error) => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
}

export async function embedQuery(query: string) {
  const { embedding, usage } = await embed({
    model: embeddingModel,
    value: query,
    providerOptions: { voyage: { inputType: "query" } },
  });
  return { embedding, tokens: usage.tokens };
}

export type Candidate = Chunk & { score: number };

/** Stage 1: bi-encoder retrieval. Fast cosine similarity over every chunk, retrieve generously. */
export async function retrieveCandidates(
  queryEmbedding: number[],
  poolSize = 10,
): Promise<Candidate[]> {
  const index = await getIndex();
  return index.chunks
    .map((chunk, i) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, index.chunkEmbeddings[i]),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, poolSize);
}

export type RerankedChunk = {
  docId: string;
  docTitle: string;
  text: string;
  score: number;
};

/** Stage 2: cross-encoder reranking. Slower, precise; narrow the candidate pool to what the model actually sees. */
export async function rerankCandidates(
  query: string,
  candidates: Candidate[],
  topN = 4,
): Promise<RerankedChunk[]> {
  const { ranking } = await rerank({
    model: rerankingModel,
    query,
    documents: candidates.map((c) => c.text),
    topN,
  });

  return ranking.map(({ originalIndex, score }) => {
    const candidate = candidates[originalIndex];
    return {
      docId: candidate.docId,
      docTitle: candidate.docTitle,
      text: candidate.text,
      score,
    };
  });
}
