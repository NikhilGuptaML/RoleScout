import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ParsedJD } from '../types';
import { loadProfile } from '../storage';
import { analyzeJD, resumeAnalysis } from '../api';

/* ── Sub-components ── */

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--color-border)]" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-[var(--color-accent)] animate-spin-slow" />
      </div>
      <p className="text-sm text-[var(--color-text-muted)] animate-pulse">Analyzing…</p>
    </div>
  );
}

function FlagBadge({ type, desc }: { type: 'Red' | 'Green'; desc: string }) {
  const isGreen = type === 'Green';
  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg p-3 border ${
        isGreen
          ? 'bg-[var(--color-green-muted)] border-[var(--color-green)]/20'
          : 'bg-[var(--color-red-muted)] border-[var(--color-red)]/20'
      }`}
    >
      <span className={`text-sm mt-0.5 ${isGreen ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
        {isGreen ? '✓' : '⚠'}
      </span>
      <span className="text-sm text-[var(--color-text-primary)]">{desc}</span>
    </div>
  );
}

function SkillTag({ name, mandatory }: { name: string; mandatory: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
        mandatory
          ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)]'
          : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
      }`}
    >
      {name}
      {!mandatory && (
        <span className="ml-1 text-[var(--color-text-muted)]">opt</span>
      )}
    </span>
  );
}

function ParsedJDView({ data }: { data: ParsedJD }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{data.role_title}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{data.company_name}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-accent-muted)] px-3.5 py-1 text-xs font-semibold text-[var(--color-accent-hover)]">
          {data.seniority_level}
        </span>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Hard Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.required_skills.hard_skills.map((s, i) => (
              <SkillTag key={i} name={s.name} mandatory={s.mandatory} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Soft Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.required_skills.soft_skills.map((s, i) => (
              <SkillTag key={i} name={s.name} mandatory={s.mandatory} />
            ))}
          </div>
        </div>
      </div>

      {/* Flags */}
      {data.flags.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Signals
          </h3>
          <div className="space-y-2">
            {data.flags.map((f, i) => (
              <FlagBadge key={i} type={f.flag_type} desc={f.desc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   AnalyzePage
   ══════════════════════════════════════════════ */

type Stage = 'input' | 'loading' | 'review' | 'resuming';

export default function AnalyzePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobDesc, setJobDesc] = useState('');
  const [stage, setStage] = useState<Stage>('input');
  const [parsedJD, setParsedJD] = useState<ParsedJD | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check for existing state from location
  const existingThreadId = (location.state as { threadId?: string })?.threadId;
  const existingParsedJD = (location.state as { parsedJD?: ParsedJD })?.parsedJD;

  // Hydrate from navigation state if present
  useState(() => {
    if (existingThreadId && existingParsedJD) {
      setThreadId(existingThreadId);
      setParsedJD(existingParsedJD);
      setStage('review');
    }
  });

  const handleAnalyze = async () => {
    const profile = loadProfile();
    if (!profile) {
      setError('No profile found. Please fill out your profile first.');
      return;
    }
    if (!jobDesc.trim()) {
      setError('Please paste a job description.');
      return;
    }

    setError(null);
    setStage('loading');

    try {
      const res = await analyzeJD({ job_desc: jobDesc, profile });
      setThreadId(res.thread_id);
      setParsedJD(res.parsed_jd);
      setStage('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStage('input');
    }
  };

  const handleResume = async (withFeedback: boolean) => {
    if (!threadId) return;

    setStage('resuming');
    setError(null);

    try {
      const res = await resumeAnalysis({
        thread_id: threadId,
        feedback: withFeedback ? feedback : null,
      });
      navigate('/report', { state: { report: res.final_report } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStage('review');
    }
  };

  return (
    <div className="animate-fade-in" id="analyze-page">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Analyze <span className="text-[var(--color-accent)]">Fit</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm max-w-md mx-auto">
          Paste a job description and let RoleScout evaluate your fit.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-[var(--color-red)]/30 bg-[var(--color-red-muted)] px-4 py-3 text-sm text-[var(--color-red)] animate-fade-in">
          {error}
        </div>
      )}

      {/* ── Stage: Input ── */}
      {(stage === 'input' || stage === 'loading') && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
            <label
              htmlFor="job-desc-input"
              className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
            >
              Job Description
            </label>
            <textarea
              id="job-desc-input"
              rows={14}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              disabled={stage === 'loading'}
              placeholder="Paste the full job description here…"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)] resize-none disabled:opacity-50"
            />
          </div>

          {stage === 'loading' ? (
            <Spinner />
          ) : (
            <div className="flex justify-end">
              <button
                id="analyze-btn"
                type="button"
                onClick={handleAnalyze}
                disabled={!jobDesc.trim()}
                className="rounded-lg bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-lg hover:shadow-[var(--color-accent)]/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Analyze Job Description
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Stage: Review (HITL) ── */}
      {stage === 'review' && parsedJD && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <ParsedJDView data={parsedJD} />
          </div>

          {/* Feedback / Continue */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 space-y-4 animate-fade-in-delay">
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">
              Feedback <span className="font-normal text-[var(--color-text-muted)]">(optional)</span>
            </h3>
            <textarea
              id="feedback-input"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add corrections or extra context for the analysis…"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)] resize-none"
            />
            <div className="flex items-center gap-3 justify-end">
              <button
                id="submit-feedback-btn"
                type="button"
                onClick={() => handleResume(true)}
                disabled={!feedback.trim()}
                className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-focus)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Feedback & Continue
              </button>
              <button
                id="continue-btn"
                type="button"
                onClick={() => handleResume(false)}
                className="rounded-lg bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-lg hover:shadow-[var(--color-accent)]/20"
              >
                Looks Good — Generate Report →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage: Resuming ── */}
      {stage === 'resuming' && <Spinner />}
    </div>
  );
}
