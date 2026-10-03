import { NextResponse } from "next/server";
import { Fetch } from "@/lib/server";
import { ApiError, type ApiErrorResponse } from "@/lib/error";
import type { RegisterResponse } from "@/lib/types";

function errorResponse(body: ApiErrorResponse, status: number) {
  return NextResponse.json<ApiErrorResponse>(body, { status });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return errorResponse(
      { error: "Body request tidak valid.", code: "BAD_REQUEST" },
      400,
    );
  }

  try {
    await Fetch<RegisterResponse>("auth/register", {
      method: "POST",
      body: JSON.stringify({ email: body.email, password: body.password }),
    });

    return NextResponse.json(
      { message: "Akun berhasil dibuat." },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return errorResponse(
        { error: error.message, code: error.code, details: error.details },
        error.status,
      );
    }

    console.error("[register] unexpected error:", error);
    return errorResponse(
      { error: "Terjadi kesalahan pada server.", code: "INTERNAL_ERROR" },
      500,
    );
  }
}
