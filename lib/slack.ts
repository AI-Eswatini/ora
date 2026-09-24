import { logger } from "@/lib/utils";

const SLACK_POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage";

const LOAN_APPROVALS_CHANNEL = process.env.SLACK_LOAN_APPROVALS_CHANNEL ?? "loan-approvals";

type SlackApiResponse = {
  ok: boolean;
  channel?: string;
  ts?: string;
  error?: string;
};

export type PostToSlackInput = {
  text: string;
  channel?: string;
  threadTs?: string;
};

export type PostToSlackResult = {
  channel: string;
  ts: string;
};

/** Slack is optional: the notify tool is only offered to the agent when a bot token is set. */
export function isSlackConfigured(): boolean {
  return Boolean(process.env.SLACK_BOT_TOKEN?.trim());
}

function authHeaders() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error("SLACK_BOT_TOKEN is not set");
  }
  return { Authorization: `Bearer ${token}` };
}

/** Posts a message to a Slack channel via the Web API's chat.postMessage method. Defaults to #loan-approvals. */
export async function postToSlack({
  text,
  channel = LOAN_APPROVALS_CHANNEL,
  threadTs,
}: PostToSlackInput): Promise<PostToSlackResult> {
  const response = await fetch(SLACK_POST_MESSAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...authHeaders(),
    },
    body: JSON.stringify({ channel, text, thread_ts: threadTs }),
  });

  const data = (await response.json()) as SlackApiResponse;

  if (!response.ok || !data.ok) {
    logger.error("slack", `chat.postMessage failed for #${channel}`, data.error ?? response.statusText);
    throw new Error(`Slack API error: ${data.error ?? response.statusText}`);
  }

  logger.info("slack", `posted message to #${channel}`, { ts: data.ts });
  return { channel: data.channel!, ts: data.ts! };
}
