import { NextResponse } from "next/server";
import { Fetch } from "@/lib/server";
import { clearAuthCookies, getRefreshToken } from "@/lib/auth/cookies";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    await Fetch("auth/logout", {
      method: "POST",
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    }).catch(() => {});
  }

  await clearAuthCookies();
  return NextResponse.json({ message: "Berhasil keluar." });
}
