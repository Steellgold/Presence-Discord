export type LogLevel = "debug" | "info" | "warn" | "error";

export type Logger = {
  readonly debug: (message: string, context?: Record<string, unknown>) => void;
  readonly info: (message: string, context?: Record<string, unknown>) => void;
  readonly warn: (message: string, context?: Record<string, unknown>) => void;
  readonly error: (message: string, context?: Record<string, unknown>) => void;
};

const writeLog = (
  scope: string,
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): void => {
  const payload = context === undefined ? "" : ` ${JSON.stringify(context)}`;
  console[level](`[${scope}] ${message}${payload}`);
};

export const createLogger = (scope: string): Logger => ({
  debug: (message, context) => {
    writeLog(scope, "debug", message, context);
  },
  info: (message, context) => {
    writeLog(scope, "info", message, context);
  },
  warn: (message, context) => {
    writeLog(scope, "warn", message, context);
  },
  error: (message, context) => {
    writeLog(scope, "error", message, context);
  },
});

