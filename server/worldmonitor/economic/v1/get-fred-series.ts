/**
 * RPC: getFredSeries -- Federal Reserve Economic Data (FRED) time series.
 */
import type {
  ServerContext,
  GetFredSeriesRequest,
  GetFredSeriesResponse,
  FredSeries,
  FredObservation,
} from '../../../../src/generated/server/worldmonitor/economic/v1/service_server';

import { cachedFetchJson } from '../../../_shared/redis';
import { CHROME_UA } from '../../../_shared/constants';

const FRED_API_BASE = 'https://api.stlouisfed.org/fred';
const FRED_CSV_BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv';
const REDIS_CACHE_KEY = 'economic:fred:v1';
const REDIS_CACHE_TTL = 3600; // 1h

function parseFredCsv(csv: string, limit: number): FredObservation[] {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 1) return [];

  const observations: FredObservation[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i]!;
    const commaIdx = line.indexOf(',');
    if (commaIdx <= 0) continue;

    const date = line.slice(0, commaIdx).trim();
    const rawValue = line.slice(commaIdx + 1).trim();
    if (!date || !rawValue || rawValue === '.') continue;

    const value = Number.parseFloat(rawValue);
    if (!Number.isFinite(value)) continue;

    observations.push({ date, value });
  }

  if (observations.length <= limit) return observations;
  return observations.slice(observations.length - limit);
}

async function fetchFredSeriesFromCsvFallback(req: GetFredSeriesRequest, limit: number): Promise<FredSeries | undefined> {
  try {
    const csvUrl = new URL(FRED_CSV_BASE);
    csvUrl.searchParams.set('id', req.seriesId);

    const response = await fetch(csvUrl.toString(), {
      headers: {
        Accept: 'text/csv,*/*;q=0.9',
        'User-Agent': CHROME_UA,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return undefined;

    const csv = await response.text();
    const observations = parseFredCsv(csv, limit);
    if (observations.length === 0) return undefined;

    return {
      seriesId: req.seriesId,
      title: req.seriesId,
      units: '',
      frequency: '',
      observations,
    };
  } catch {
    return undefined;
  }
}

async function fetchFredSeries(req: GetFredSeriesRequest): Promise<FredSeries | undefined> {
  const limit = req.limit > 0 ? Math.min(req.limit, 1000) : 120;

  try {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) {
      return fetchFredSeriesFromCsvFallback(req, limit);
    }

    const obsParams = new URLSearchParams({
      series_id: req.seriesId,
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'desc',
      limit: String(limit),
    });

    const metaParams = new URLSearchParams({
      series_id: req.seriesId,
      api_key: apiKey,
      file_type: 'json',
    });

    const [obsResponse, metaResponse] = await Promise.all([
      fetch(`${FRED_API_BASE}/series/observations?${obsParams}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${FRED_API_BASE}/series?${metaParams}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    if (!obsResponse.ok) {
      return fetchFredSeriesFromCsvFallback(req, limit);
    }

    const obsData = await obsResponse.json() as { observations?: Array<{ date: string; value: string }> };

    const observations: FredObservation[] = (obsData.observations || [])
      .map((obs) => {
        const value = Number.parseFloat(obs.value);
        if (!Number.isFinite(value) || obs.value === '.') return null;
        return { date: obs.date, value };
      })
      .filter((o): o is FredObservation => o !== null)
      .reverse(); // oldest first

    let title = req.seriesId;
    let units = '';
    let frequency = '';

    if (metaResponse.ok) {
      const metaData = await metaResponse.json() as { seriess?: Array<{ title?: string; units?: string; frequency?: string }> };
      const meta = metaData.seriess?.[0];
      if (meta) {
        title = meta.title || req.seriesId;
        units = meta.units || '';
        frequency = meta.frequency || '';
      }
    }

    if (observations.length === 0) {
      return fetchFredSeriesFromCsvFallback(req, limit);
    }

    return {
      seriesId: req.seriesId,
      title,
      units,
      frequency,
      observations,
    };
  } catch {
    return fetchFredSeriesFromCsvFallback(req, limit);
  }
}

export async function getFredSeries(
  _ctx: ServerContext,
  req: GetFredSeriesRequest,
): Promise<GetFredSeriesResponse> {
  if (!req.seriesId) return { series: undefined };

  try {
    const cacheKey = `${REDIS_CACHE_KEY}:${req.seriesId}:${req.limit || 0}`;
    const result = await cachedFetchJson<GetFredSeriesResponse>(cacheKey, REDIS_CACHE_TTL, async () => {
      const series = await fetchFredSeries(req);
      return series ? { series } : null;
    });
    return result || { series: undefined };
  } catch {
    return { series: undefined };
  }
}
