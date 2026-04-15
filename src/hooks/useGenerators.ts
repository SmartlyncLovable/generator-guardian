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

export function useGeneratorAnalytics(id: string, range: '1h' | '24h' | '7d' = '24h') {
  const [data, setData] = useState<AnalyticsResponse['data']>([]);

  useEffect(() => {
    generatorApi.analytics(id, range).then(r => setData(r.data));
  }, [id, range]);

  return { data };
}