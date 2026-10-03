import { ApiError, type ApiErrorResponse } from "./error";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function api<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse;

    throw new ApiError(
      data.error ?? "Terjadi kesalahan",
      response.status,
      data.code,
      data.details,
    );
  }

  return response.json() as Promise<T>;
}
