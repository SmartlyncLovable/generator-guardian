import { GeneratorDetailResponse, GeneratorListResponse, LiveParametersResponse, AnalyticsResponse } from '@/types/generator';
const BASE_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:8009/api';

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayRange() {
  const today = new Date();
  const date = formatDate(today);
  return { startDate: date, endDate: date };
}

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

  analytics: (id: string, range?: '1h' | '24h' | '7d' | 'none', startDate?: string, endDate?: string) => {
    const rangeDates = getTodayRange();
    const s = startDate ?? rangeDates.startDate;
    const e = endDate ?? rangeDates.endDate;
    console.log(`Fetching analytics with date range ${s} to ${e}`);
    return request<AnalyticsResponse>(
      `/generators/${id}/report?startDate=${encodeURIComponent(s)}&endDate=${encodeURIComponent(e)}`
    );
  },

  liveParameters: (id: string) =>
    request<LiveParametersResponse>(`/generators/${id}/live`),
};