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
  list: () => {
    return request<GeneratorListResponse>(`/generators`);
  },
  getIP: (id: string) =>
    request<GeneratorDetailResponse>(`/generators/${id}/ip`),

  get: (id: string) =>
    request<GeneratorDetailResponse>(`/generators/${id}`),

  analytics: (id: string, range?: '1h' | '24h' | '7d' | 'none') => {
    if (range && range === 'none') {
        console.log("Fetching analytics without range parameter");
        return request<AnalyticsResponse>(
            `/generators/${id}/analytics/today`
        );
    } else {
        console.log(`Fetching analytics with range=${range}`);
      return request<AnalyticsResponse>(
        `/generators/${id}/analytics?range=${range}`
      );
    }
  },

  liveParameters: (id: string) =>
    request<LiveParametersResponse>(`/generators/${id}/live`),
};