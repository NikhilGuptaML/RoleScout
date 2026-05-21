import { useLocation, Link } from 'react-router-dom';
import Markdown from 'react-markdown';

export default function ReportPage() {
  const location = useLocation();
  const report = (location.state as { report?: string })?.report;

  if (!report) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-24 text-center" id="report-page-empty">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center mb-6">
          <span className="text-2xl text-[var(--color-text-muted)]">◇</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">No Report Yet</h1>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mb-6">
          Complete an analysis to view your fit report here.
        </p>
        <Link
          to="/analyze"
          id="go-to-analyze-link"
          className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-lg hover:shadow-[var(--color-accent)]/20"
        >
          Go to Analyze
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" id="report-page">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Fit <span className="text-[var(--color-accent)]">Report</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Your personalized job fit analysis
        </p>
      </div>

      {/* Report Content */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 md:p-8">
        <div className="prose max-w-none">
          <Markdown>{report}</Markdown>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border)]">
        <Link
          to="/analyze"
          id="new-analysis-link"
          className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          ← New Analysis
        </Link>
        <button
          id="copy-report-btn"
          type="button"
          onClick={() => navigator.clipboard.writeText(report)}
          className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-focus)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
