import "server-only";
import { request } from "./client";

const API_URL = process.env.API_URL;

function joinUrl(base: string, endpoint: string) {
  return `${base.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
}

export function Fetch<T>(endpoint: string, options?: RequestInit) {
  if (!API_URL) {
    throw new Error("API_URL belum diset di .env");
  }

  return request<T>(joinUrl(API_URL, endpoint), options);
}
