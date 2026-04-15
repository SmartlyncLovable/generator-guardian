import { GeneratorDetailResponse, GeneratorListResponse, LiveParametersResponse, AnalyticsResponse } from '@/types/generator';
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const generatorApi = {
  /*list: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<GeneratorListResponse>(`/generators${q ? `?${q}` : ''}`);
  },*/
  list: () => {
    return request<GeneratorListResponse>(`/generators`);
  },
  get: (id: string) => request<GeneratorDetailResponse>(`/generators/${id}`),
  analytics: (id: string, range?: '1h' | '24h' | '7d') =>
    request<AnalyticsResponse>(`/generators/${id}/analytics${range ? `?range=${range}` : ''}`),
  liveParameters: (id: string) => request<LiveParametersResponse>(`/generators/${id}/live`),
};