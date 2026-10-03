import { NextResponse } from "next/server";
import { Fetch } from "@/lib/server";
import {
  clearAuthCookies,
  getRefreshToken,
  setAuthCookies,
} from "@/lib/auth/cookies";
import { ApiError } from "@/lib/error";
import { errorResponse, routeError } from "@/lib/route-error";
import type { AuthResponse } from "@/lib/types";

export async function POST(request: NextResponse) {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return errorResponse(
      {
        error: "Session not found.",
        code: "UNAUTHORIZED",
      },
      401,
    );
  }

  try {
    const data = await Fetch<AuthResponse>("auth/refresh", {
      method: "POST",
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    await setAuthCookies(data);
    return NextResponse.json({
      user: data.user,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await clearAuthCookies();
    }
    return routeError(error, "refresh");
  }
}
