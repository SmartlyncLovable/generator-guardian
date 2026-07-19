import { useEffect, useState } from 'react';
import { generatorApi } from '@/services/generatorApi';
import { AnalyticsResponse } from '@/types/generator';

export function useGenerators(filters?: { status?: string; search?: string }) {
  const [data, setData] = useState<Generator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    generatorApi.list(filters)
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters?.status, filters?.search]);

  return { data, loading, error };
}

export function useGeneratorLive(id: string, pollMs = 5000) {
  const [params, setParams] = useState<LiveParameters | null>(null);

  useEffect(() => {
    const fetch = () => generatorApi.liveParameters(id).then(setParams);
    fetch();
    const t = setInterval(fetch, pollMs);
    return () => clearInterval(t);
  }, [id, pollMs]);

  return params;
}

export function useGenerator(id: string) {
  const [data, setData] = useState<Generator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    generatorApi.get(id)
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

export function useGeneratorAnalytics(
  id: string,
  range: '1h' | 'none' | '24h' | '7d' = '24h',
  startDate?: string,
  endDate?: string
) {
  const [data, setData] = useState<AnalyticsResponse['data']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await generatorApi.analytics(
          id,
          range,
          startDate,
          endDate
        );

        setData(response.data ?? []);
        console.log('Fetched analytics data:', response);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch analytics';
        console.error('Failed to fetch analytics:', error);
        setError(message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, range, startDate, endDate]);

  return { data, loading, error };
}

export function useGeneratorIP(id: string) {
  const [data, setData] = useState<Generator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    generatorApi.getIP(id)
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}