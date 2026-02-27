import { NextResponse } from "next/server";
import { generateRequestId } from "./request-id";

type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "BAD_GATEWAY";

interface ApiErrorOptions {
  code: ErrorCode;
  message: string;
  status: number;
  details?: Record<string, unknown>;
  requestId?: string;
}

export function apiError(options: ApiErrorOptions): NextResponse {
  const { code, message, status, details, requestId } = options;
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
        requestId: requestId ?? generateRequestId(),
      },
    },
    { status }
  );
}

export function badRequest(message: string, details?: Record<string, unknown>) {
  return apiError({ code: "VALIDATION_ERROR", message, status: 400, details });
}

export function unauthorized(message = "Authentication required") {
  return apiError({ code: "UNAUTHORIZED", message, status: 401 });
}

export function forbidden(message = "Insufficient permissions") {
  return apiError({ code: "FORBIDDEN", message, status: 403 });
}

export function notFound(message = "Resource not found") {
  return apiError({ code: "NOT_FOUND", message, status: 404 });
}

export function conflict(message: string) {
  return apiError({ code: "CONFLICT", message, status: 409 });
}

export function validationError(message: string, details?: Record<string, unknown>) {
  return apiError({ code: "VALIDATION_ERROR", message, status: 422, details });
}

export function rateLimited(message = "Too many requests") {
  return apiError({ code: "RATE_LIMITED", message, status: 429 });
}

export function internalError(message = "Internal server error") {
  return apiError({ code: "INTERNAL_ERROR", message, status: 500 });
}

export function badGateway(message = "External service unavailable") {
  return apiError({ code: "BAD_GATEWAY", message, status: 502 });
}
