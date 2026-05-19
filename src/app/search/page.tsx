/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useDoctorSearch, useSpecialties } from '@/hooks';
import { SearchFilters, ConsultationMode } from '@/types';
import DoctorCard from '@/components/doctors/DoctorCard';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo, Suspense } from 'react';

const pageStyles = css`
  max-width: 1200px;
  margin: 0 auto;
  /* FIX: ensure page never causes body overflow */
  padding: 16px 16px 80px;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;

  @media (min-width: 768px) {
    padding: ${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing.xl};
  }

  /* ── Header ── */
  .search-header {
    margin-bottom: 16px;

    h1 {
      font-family: ${theme.fonts.heading};
      font-size: 22px; font-weight: 700;
      margin: 0;
      @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; }
    }

    .result-count {
      color: ${theme.colors.textSecondary};
      font-size: 13px; margin-top: 4px;
    }
  }

  /* ── Search bar ── */
  .search-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;

    input {
      flex: 1;
      /* FIX: min-width: 0 prevents input from overflowing flex parent */
      min-width: 0;
      padding: 12px 16px;
      border: 1.5px solid ${theme.colors.border};
      border-radius: 12px;
      font-size: 15px;
      outline: none;
      background: white;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      -webkit-appearance: none;

      &::placeholder { color: ${theme.colors.textMuted}; }
      &:focus {
        border-color: ${theme.colors.primary};
        box-shadow: 0 0 0 3px ${theme.colors.primary}18;
      }
    }

    .search-submit {
      flex-shrink: 0;
      padding: 12px 18px;
      background: ${theme.colors.primary}; color: white;
      border: none; border-radius: 12px;
      font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.15s ease;

      &:hover { background: ${theme.colors.primaryDark}; }
    }
  }

  /* ── Filter bar (mobile: horizontal scroll, desktop: wrap) ── */
  .filter-bar {
    margin-bottom: 14px;
  }

  /* Active filter summary pill (mobile only) */
  .filter-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    flex-wrap: wrap;

    .active-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px;
      background: ${theme.colors.primaryBg};
      border: 1px solid ${theme.colors.primaryLight};
      border-radius: 100px;
      font-size: 12px; font-weight: 500; color: ${theme.colors.primary};

      .remove { background: none; border: none; padding: 0; cursor: pointer;
        font-size: 13px; line-height: 1; color: ${theme.colors.primary};
        display: flex; align-items: center;
      }
    }
  }

  /* Scrollable filter chips row */
  .filter-chips {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    @media (min-width: 768px) {
      flex-wrap: wrap;
      overflow-x: visible;
    }

    .chip {
      flex-shrink: 0;
      display: inline-flex; align-items: center; gap: 5px;
      padding: 8px 14px;
      border: 1.5px solid ${theme.colors.border};
      border-radius: 100px;
      background: white;
      font-size: 13px; font-weight: 500;
      color: ${theme.colors.text};
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
      -webkit-tap-highlight-color: transparent;

      &:hover { border-color: ${theme.colors.primary}; color: ${theme.colors.primary}; }

      &.active {
        background: ${theme.colors.primary};
        border-color: ${theme.colors.primary};
        color: white;
      }
    }

    /* Native select styled like chip */
    .chip-select {
      flex-shrink: 0;
      -webkit-appearance: none;
      appearance: none;
      padding: 8px 30px 8px 14px;
      border: 1.5px solid ${theme.colors.border};
      border-radius: 100px;
      background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center;
      font-size: 13px; font-weight: 500;
      color: ${theme.colors.text};
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
      outline: none;

      &:hover { border-color: ${theme.colors.primary}; }

      &.active {
        border-color: ${theme.colors.primary};
        color: ${theme.colors.primary};
        background-color: ${theme.colors.primaryBg};
      }
    }
  }

  /* ── Sort bar ── */
  .sort-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;

    .result-count-inline {
      font-size: 13px; color: ${theme.colors.textSecondary};
    }

    .sort-select {
      -webkit-appearance: none;
      appearance: none;
      padding: 7px 28px 7px 12px;
      border: 1.5px solid ${theme.colors.border};
      border-radius: 8px;
      font-size: 13px;
      background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 8px center;
      outline: none;
      color: ${theme.colors.text};

      &:focus { border-color: ${theme.colors.primary}; }
    }
  }

  /* ── Results grid ── */
  .results {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;

    @media (min-width: 540px) {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    @media (min-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: ${theme.spacing.lg};
    }
  }

  /* ── No results ── */
  .no-results {
    text-align: center;
    padding: 60px 20px;
    color: ${theme.colors.textMuted};

    .emoji { font-size: 48px; margin-bottom: 12px; }
    h3 { font-size: 16px; color: ${theme.colors.text}; font-weight: 600; margin: 0; }
    p { margin-top: 8px; font-size: 14px; }

    .reset-btn {
      margin-top: 20px;
      padding: 10px 24px;
      background: ${theme.colors.primary}; color: white;
      border: none; border-radius: 100px;
      font-size: 14px; font-weight: 600;
      cursor: pointer;
    }
  }

  /* ── Loading skeleton ── */
  .skeleton-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;

    @media (min-width: 540px) {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .skeleton-card {
      height: 200px;
      border-radius: ${theme.radii.xl};
      background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  }
`;

const FEE_OPTIONS = [
  { label: 'Under ₹500', value: 500 },
  { label: 'Under ₹800', value: 800 },
  { label: 'Under ₹1,000', value: 1000 },
  { label: 'Under ₹1,500', value: 1500 },
];

function SearchContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>({
    specialty: searchParams.get('specialty') || undefined,
    mode: (searchParams.get('mode') as ConsultationMode) || undefined,
    maxFee: searchParams.get('maxFee') ? Number(searchParams.get('maxFee')) : undefined,
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  const { data: specialties } = useSpecialties();

  const searchFilters = useMemo(() => {
    const f: SearchFilters = { ...filters };
    if (query) f.specialty = query;
    return f;
  }, [filters, query]);

  const { data: doctors, isLoading } = useDoctorSearch(searchFilters);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({ sortBy: 'rating', sortOrder: 'desc' });
  };

  const hasActiveFilters = !!(filters.specialty || filters.mode || filters.maxFee || query);

  const activePills: { label: string; onRemove: () => void }[] = [];
  if (filters.mode) activePills.push({ label: filters.mode === 'online' ? '💻 Online' : '🏥 In-Clinic', onRemove: () => updateFilter('mode', filters.mode) });
  if (filters.maxFee) activePills.push({ label: `Under ₹${filters.maxFee.toLocaleString()}`, onRemove: () => updateFilter('maxFee', filters.maxFee) });
  if (filters.specialty && !query) activePills.push({ label: filters.specialty, onRemove: () => updateFilter('specialty', filters.specialty) });

  return (
    <div css={pageStyles}>
      <div className="search-header">
        <h1>Find Doctors</h1>
      </div>

      {/* Search input */}
      <div className="search-bar">
        <input
          type="search"
          placeholder="Search by specialty or doctor name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          enterKeyHint="search"
        />
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {/* Active filter pills (only when filters set) */}
        {activePills.length > 0 && (
          <div className="filter-summary">
            {activePills.map((pill) => (
              <span key={pill.label} className="active-pill">
                {pill.label}
                <button className="remove" onClick={pill.onRemove} aria-label={`Remove ${pill.label} filter`}>×</button>
              </span>
            ))}
            {activePills.length > 1 && (
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', fontSize: 12, color: theme.colors.error, cursor: 'pointer', fontWeight: 500 }}>
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Scrollable chips */}
        <div className="filter-chips">
          {/* Specialty select */}
          <select
            className={`chip-select ${filters.specialty && !query ? 'active' : ''}`}
            value={filters.specialty || ''}
            onChange={(e) => setFilters((f) => ({ ...f, specialty: e.target.value || undefined }))}
            aria-label="Filter by specialty"
          >
            <option value="">All Specialties</option>
            {specialties?.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Mode chips */}
          <button
            className={`chip ${filters.mode === 'online' ? 'active' : ''}`}
            onClick={() => updateFilter('mode', 'online')}
          >
            💻 Online
          </button>
          <button
            className={`chip ${filters.mode === 'offline' ? 'active' : ''}`}
            onClick={() => updateFilter('mode', 'offline')}
          >
            🏥 In-Clinic
          </button>

          {/* Fee select */}
          <select
            className={`chip-select ${filters.maxFee ? 'active' : ''}`}
            value={filters.maxFee || ''}
            onChange={(e) => setFilters((f) => ({ ...f, maxFee: e.target.value ? Number(e.target.value) : undefined }))}
            aria-label="Filter by max fee"
          >
            <option value="">Any Fee</option>
            {FEE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort + count bar */}
      <div className="sort-bar">
        <span className="result-count-inline">
          {isLoading ? 'Searching...' : `${doctors?.length ?? 0} doctor${doctors?.length !== 1 ? 's' : ''} found`}
        </span>
        <select
          className="sort-select"
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split('-');
            setFilters((f) => ({ ...f, sortBy: by as any, sortOrder: order as any }));
          }}
          aria-label="Sort doctors"
        >
          <option value="rating-desc">Highest Rated</option>
          <option value="fee-asc">Lowest Fee</option>
          <option value="fee-desc">Highest Fee</option>
          <option value="experience-desc">Most Experienced</option>
        </select>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : doctors && doctors.length > 0 ? (
        <div className="results">
          {doctors.map((doc) => (
            <DoctorCard key={doc.uid} doctor={doc} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <div className="emoji">🔍</div>
          <h3>No doctors found</h3>
          <p>Try adjusting your filters or searching for a different specialty</p>
          {hasActiveFilters && (
            <button className="reset-btn" onClick={clearFilters}>Clear all filters</button>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '40px 16px', textAlign: 'center', color: theme.colors.textMuted }}>
        Loading...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}