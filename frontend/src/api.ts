import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ResumeRequest,
  ResumeResponse,
} from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '';
const BASE = `${API_URL}/analyze`;
const API_KEY = import.meta.env.VITE_API_KEY ?? '';

const authHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
};

export async function analyzeJD(
  body: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Analyze failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function resumeAnalysis(
  body: ResumeRequest
): Promise<ResumeResponse> {
  const res = await fetch(`${BASE}/resume`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resume failed (${res.status}): ${text}`);
  }
  return res.json();
}
