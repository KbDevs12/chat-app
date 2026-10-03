import { ApiError, type ApiErrorResponse } from "./error";

export async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server.",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const err = data as Partial<ApiErrorResponse> | null;

    throw new ApiError(
      err?.error ?? "Terjadi kesalahan",
      response.status,
      err?.code,
      err?.details,
    );
  }

  return data as T;
}
