import "server-only";
import { NextResponse } from "next/server";
import { ApiError, type ApiErrorResponse } from "./error";

export function errorResponse(
  body: ApiErrorResponse,
  status: number,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json<ApiErrorResponse>(body, { status });
}

export function routeError(
  error: unknown,
  tag: string,
): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    return errorResponse(
      { error: error.message, code: error.code, details: error.details },
      error.status,
    );
  }

  console.error(`[${tag}] unexpected error:`, error);
  return errorResponse(
    { error: "Terjadi kesalahan pada server.", code: "INTERNAL_ERROR" },
    500,
  );
}
