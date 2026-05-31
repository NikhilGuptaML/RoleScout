import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ResumeRequest,
  ResumeResponse,
} from './types';

const BASE = '/api/analyze';

const jsonHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};

export async function analyzeJD(
  body: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: jsonHeaders,
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
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resume failed (${res.status}): ${text}`);
  }
  return res.json();
}
