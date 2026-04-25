type LoggerLevel = "info" | "warn" | "error";

type LoggerPayload = {
  level: LoggerLevel;
  event: string;
  timestamp: string;
  request: {
    method: string;
    path: string;
    requestId: string;
  };
  meta?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

type LoggerFn = (event: string, data?: Record<string, unknown>) => void;

type RequestLogger = {
  enabled: boolean;
  info: LoggerFn;
  warn: LoggerFn;
  error: LoggerFn;
};

export function isRequestLoggingEnabled(request: Request): boolean {
  const url = new URL(request.url);
  return url.searchParams.get("showlogger") === "true";
}

function safeErrorData(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
    };
  }

  if (error && typeof error === "object") {
    return {
      errorMessage: "Non-Error exception",
    };
  }

  return {
    errorMessage: String(error),
  };
}

export function createRequestLogger(
  request: Request,
  meta?: Record<string, unknown>,
): RequestLogger {
  const enabled = isRequestLoggingEnabled(request);
  const url = new URL(request.url);
  const requestContext = {
    method: request.method,
    path: url.pathname,
    requestId: crypto.randomUUID(),
  };

  const emit = (level: LoggerLevel, event: string, data?: Record<string, unknown>) => {
    if (!enabled) {
      return;
    }

    const payload: LoggerPayload = {
      level,
      event,
      timestamp: new Date().toISOString(),
      request: requestContext,
      meta,
      data,
    };

    const line = JSON.stringify(payload);
    if (level === "error") {
      console.error(line);
      return;
    }
    if (level === "warn") {
      console.warn(line);
      return;
    }
    console.log(line);
  };

  return {
    enabled,
    info: (event, data) => emit("info", event, data),
    warn: (event, data) => emit("warn", event, data),
    error: (event, data) => emit("error", event, data),
  };
}

export function logRequestException(
  logger: RequestLogger,
  event: string,
  error: unknown,
  data?: Record<string, unknown>,
) {
  logger.error(event, {
    ...data,
    ...safeErrorData(error),
  });
}
