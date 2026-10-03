import { NextResponse } from "next/server";
import { Fetch } from "@/lib/server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { errorResponse, routeError } from "@/lib/route-error";
import { LoginSchema } from "@/lib/validations/login.schema";
import type { AuthResponse } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      { error: "Body request tidak valid.", code: "BAD_REQUEST" },
      400,
    );
  }

  try {
    const data = await Fetch<AuthResponse>("auth/login", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    await setAuthCookies(data);

    return NextResponse.json({ user: data.user });
  } catch (error) {
    return routeError(error, "login");
  }
}
