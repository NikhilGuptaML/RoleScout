import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Profile, Skill, Project, DeploymentStatus } from '../types';
import { loadProfile, saveProfile } from '../storage';

/* ── Helpers ── */

const EMPTY_SKILL: Skill = { name: '', proficiency: 5 };

const EMPTY_PROJECT: Project = {
  name: '',
  tech_stack: [],
  deployment_status: 'not_deployed',
};

const EMPTY_PROFILE: Profile = {
  name: '',
  skills: { hard_skills: [{ ...EMPTY_SKILL }], soft_skills: [{ ...EMPTY_SKILL }] },
  experience_years: 0,
  projects: [{ ...EMPTY_PROJECT, tech_stack: [] }],
  preferred_roles: [],
  location: '',
};

const DEPLOYMENT_OPTIONS: { value: DeploymentStatus; label: string }[] = [
  { value: 'not_deployed', label: 'Not Deployed' },
  { value: 'internal', label: 'Internal' },
  { value: 'public', label: 'Public' },
  { value: 'production', label: 'Production' },
];

/* ── Sub-components ── */

function SectionHeading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{children}</h2>
      {sub && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{sub}</p>}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function Input({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  min,
  max,
}: {
  id: string;
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]"
      />
    </div>
  );
}

function ProficiencySlider({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - 1) / 9) * 100;
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${pct}%, var(--color-bg-elevated) ${pct}%, var(--color-bg-elevated) 100%)`,
        }}
      />
      <span className="w-7 text-center text-sm font-semibold text-[var(--color-accent-hover)] tabular-nums">
        {value}
      </span>
    </div>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors text-lg leading-none"
    >
      ×
    </button>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors font-medium"
    >
      <span className="text-base">+</span>
      {children}
    </button>
  );
}

/* ── Skill List Editor ── */

function SkillListEditor({
  label,
  skills,
  onChange,
  idPrefix,
}: {
  label: string;
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  idPrefix: string;
}) {
  const update = (i: number, patch: Partial<Skill>) => {
    const next = skills.map((s, j) => (j === i ? { ...s, ...patch } : s));
    onChange(next);
  };

  const remove = (i: number) => {
    if (skills.length <= 1) return;
    onChange(skills.filter((_, j) => j !== i));
  };

  const add = () => onChange([...skills, { ...EMPTY_SKILL }]);

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">
        {label}
      </h3>
      <div className="space-y-3">
        {skills.map((skill, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg bg-[var(--color-bg-elevated)] p-3 border border-[var(--color-border)]/50"
          >
            <input
              id={`${idPrefix}-name-${i}`}
              type="text"
              value={skill.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Skill name"
              className="flex-1 min-w-0 bg-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none"
            />
            <div className="w-36 shrink-0">
              <ProficiencySlider
                id={`${idPrefix}-prof-${i}`}
                value={skill.proficiency}
                onChange={(v) => update(i, { proficiency: v })}
              />
            </div>
            <RemoveButton onClick={() => remove(i)} label={`Remove ${label.toLowerCase()} ${i + 1}`} />
          </div>
        ))}
      </div>
      <div className="mt-2">
        <AddButton onClick={add}>Add {label.toLowerCase().replace(/s$/, '')}</AddButton>
      </div>
    </div>
  );
}

/* ── Project Editor ── */

function ProjectEditor({
  projects,
  onChange,
}: {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}) {
  const update = (i: number, patch: Partial<Project>) => {
    const next = projects.map((p, j) => (j === i ? { ...p, ...patch } : p));
    onChange(next);
  };

  const remove = (i: number) => {
    if (projects.length <= 1) return;
    onChange(projects.filter((_, j) => j !== i));
  };

  const add = () => onChange([...projects, { ...EMPTY_PROJECT, tech_stack: [] }]);

  return (
    <div className="space-y-3">
      {projects.map((proj, i) => (
        <div
          key={i}
          className="rounded-lg border border-[var(--color-border)]/50 bg-[var(--color-bg-elevated)] p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-3">
              <input
                id={`project-name-${i}`}
                type="text"
                value={proj.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Project name"
                className="w-full bg-transparent text-sm font-medium text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none"
              />
              <input
                id={`project-stack-${i}`}
                type="text"
                value={proj.tech_stack.join(', ')}
                onChange={(e) =>
                  update(i, {
                    tech_stack: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Tech stack (comma-separated)"
                className="w-full bg-transparent text-sm text-[var(--color-text-secondary)] placeholder-[var(--color-text-muted)] outline-none"
              />
              <select
                id={`project-status-${i}`}
                value={proj.deployment_status}
                onChange={(e) =>
                  update(i, { deployment_status: e.target.value as DeploymentStatus })
                }
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] outline-none cursor-pointer"
              >
                {DEPLOYMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <RemoveButton onClick={() => remove(i)} label={`Remove project ${i + 1}`} />
          </div>
        </div>
      ))}
      <AddButton onClick={add}>Add project</AddButton>
    </div>
  );
}

/* ── Tag Input (for preferred_roles) ── */

function TagInput({
  id,
  label,
  tags,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-accent-muted)] px-3 py-1 text-xs font-medium text-[var(--color-accent-hover)]"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-[var(--color-accent)] hover:text-[var(--color-red)] transition-colors"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-focus)] transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ProfilePage
   ══════════════════════════════════════════════ */

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = loadProfile();
    if (stored) setProfile(stored);
  }, []);

  const patch = useCallback(
    (updates: Partial<Profile>) => {
      setProfile((prev) => ({ ...prev, ...updates }));
      setSaved(false);
    },
    []
  );

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleContinue = () => {
    saveProfile(profile);
    navigate('/analyze');
  };

  const isValid =
    profile.name.trim() !== '' &&
    profile.skills.hard_skills.some((s) => s.name.trim() !== '') &&
    profile.location.trim() !== '';

  return (
    <div className="animate-fade-in space-y-6" id="profile-page">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Build Your <span className="text-[var(--color-accent)]">Profile</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm max-w-md mx-auto">
          Tell us about yourself so RoleScout can analyze your fit against any job description.
        </p>
      </div>

      {/* Name + Experience + Location */}
      <Card>
        <SectionHeading sub="Basic information about you">General</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            id="profile-name"
            label="Full Name"
            value={profile.name}
            onChange={(v) => patch({ name: v })}
            placeholder="John Doe"
          />
          <Input
            id="profile-experience"
            label="Years of Experience"
            type="number"
            value={profile.experience_years}
            onChange={(v) => patch({ experience_years: Math.max(0, parseInt(v) || 0) })}
            min={0}
            max={50}
          />
          <Input
            id="profile-location"
            label="Location"
            value={profile.location}
            onChange={(v) => patch({ location: v })}
            placeholder="San Francisco, CA"
          />
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <SectionHeading sub="Rate your proficiency from 1 (beginner) to 10 (expert)">Skills</SectionHeading>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkillListEditor
            label="Hard Skills"
            skills={profile.skills.hard_skills}
            onChange={(hard_skills) =>
              patch({ skills: { ...profile.skills, hard_skills } })
            }
            idPrefix="hard"
          />
          <SkillListEditor
            label="Soft Skills"
            skills={profile.skills.soft_skills}
            onChange={(soft_skills) =>
              patch({ skills: { ...profile.skills, soft_skills } })
            }
            idPrefix="soft"
          />
        </div>
      </Card>

      {/* Projects */}
      <Card>
        <SectionHeading sub="Showcase your best work">Projects</SectionHeading>
        <ProjectEditor
          projects={profile.projects}
          onChange={(projects) => patch({ projects })}
        />
      </Card>

      {/* Preferred Roles */}
      <Card>
        <SectionHeading sub="What roles are you targeting?">Preferred Roles</SectionHeading>
        <TagInput
          id="preferred-roles"
          label="Roles"
          tags={profile.preferred_roles}
          onChange={(preferred_roles) => patch({ preferred_roles })}
          placeholder="e.g. ML Engineer"
        />
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="save-profile-btn"
          type="button"
          onClick={handleSave}
          disabled={!isValid}
          className={`
            rounded-lg border px-5 py-2.5 text-sm font-medium transition-all duration-200
            ${
              saved
                ? 'border-[var(--color-green)] text-[var(--color-green)] bg-[var(--color-green-muted)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-focus)] hover:text-[var(--color-text-primary)]'
            }
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
        >
          {saved ? '✓ Saved' : 'Save Profile'}
        </button>

        <button
          id="continue-to-analyze-btn"
          type="button"
          onClick={handleContinue}
          disabled={!isValid}
          className="rounded-lg bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-lg hover:shadow-[var(--color-accent)]/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Analyze →
        </button>
      </div>
    </div>
  );
}
