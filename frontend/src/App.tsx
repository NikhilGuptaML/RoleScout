import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import AnalyzePage from './pages/AnalyzePage';
import ReportPage from './pages/ReportPage';

const NAV_ITEMS = [
  { to: '/', label: 'Profile', icon: '◆' },
  { to: '/analyze', label: 'Analyze', icon: '◈' },
  { to: '/report', label: 'Report', icon: '◇' },
];

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col" id="app-root">
      {/* ── Top Nav ── */}
      <header
        id="main-header"
        className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2 group" id="logo-link">
            <span className="text-xl font-bold tracking-tight text-[var(--color-accent)] group-hover:text-[var(--color-accent-hover)] transition-colors">
              Role
            </span>
            <span className="text-xl font-light tracking-tight text-[var(--color-text-primary)]">
              Scout
            </span>
          </Link>

          <nav className="flex items-center gap-1" id="main-nav">
            {NAV_ITEMS.map(({ to, label, icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  id={`nav-${label.toLowerCase()}`}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]'
                    }
                  `}
                >
                  <span className="mr-1.5 text-xs">{icon}</span>
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Routes>
            <Route path="/" element={<ProfilePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/report" element={<ReportPage />} />
          </Routes>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        id="main-footer"
        className="border-t border-[var(--color-border)] py-4 text-center text-xs text-[var(--color-text-muted)]"
      >
        RoleScout · AI-powered job fit analysis
      </footer>
    </div>
  );
}
