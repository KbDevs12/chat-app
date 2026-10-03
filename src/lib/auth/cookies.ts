import "server-only";
import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
} from "./constants";

const base = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(tokens: {
  access_token: string;
  refresh_token: string;
}) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, tokens.access_token, {
    ...base,
    maxAge: ACCESS_MAX_AGE,
  });
  store.set(REFRESH_COOKIE, tokens.refresh_token, {
    ...base,
    maxAge: ACCESS_MAX_AGE,
  });
}
