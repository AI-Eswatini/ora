import { createAgentUIStreamResponse } from "ai";
import { oraAgent } from "@/lib/ora/agent";
import { logger } from "@/lib/utils";

export async function POST(request: Request) {
  const { messages } = await request.json();

  return createAgentUIStreamResponse({
    agent: oraAgent,
    uiMessages: messages,
    sendReasoning: true,
    messageMetadata: ({ part }) => {
      if (part.type === "finish") {
        return { usage: part.totalUsage };
      }
    },
    onError: (error) => {
      logger.error("chat-route", "stream error", error);
      return error instanceof Error ? error.message : "Something went wrong. Check server logs.";
    },
  });
}
