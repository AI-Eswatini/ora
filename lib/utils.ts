type LogLevel = "info" | "warn" | "error";

const RESET = "\x1b[0m";
const LEVEL_COLORS: Record<LogLevel, string> = {
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};
const SCOPE_COLORS = ["\x1b[35m", "\x1b[32m", "\x1b[34m", "\x1b[95m", "\x1b[92m", "\x1b[94m"];

function scopeColor(scope: string): string {
  let hash = 0;
  for (const char of scope) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return SCOPE_COLORS[Math.abs(hash) % SCOPE_COLORS.length];
}

function format(level: LogLevel, scope: string, message: string, data?: unknown): string {
  const parts = [
    new Date().toISOString(),
    `${LEVEL_COLORS[level]}[${level.toUpperCase()}]${RESET}`,
    `${scopeColor(scope)}[${scope}]${RESET}`,
    message,
  ];
  if (data instanceof Error) {
    parts.push(`- ${data.message}`, data.stack ?? "");
  } else if (data !== undefined) {
    parts.push(JSON.stringify(data));
  }
  return parts.join(" ");
}

export const logger = {
  info(scope: string, message: string, data?: unknown) {
    console.log(format("info", scope, message, data));
  },
  warn(scope: string, message: string, data?: unknown) {
    console.warn(format("warn", scope, message, data));
  },
  error(scope: string, message: string, data?: unknown) {
    console.error(format("error", scope, message, data));
  },
};
