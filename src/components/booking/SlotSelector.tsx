/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { DoctorSlot } from '@/types';
import { useSlots } from '@/hooks';
import { useState } from 'react';
import { getNextNDates, formatDate, formatTime, isToday } from '@/lib/utils';

const styles = css`
  .date-strip {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.lg};
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    .date-chip {
      flex-shrink: 0;
      padding: 10px 16px;
      border-radius: ${theme.radii.lg};
      border: 1.5px solid ${theme.colors.border};
      background: white;
      cursor: pointer;
      text-align: center;
      transition: all ${theme.transitions.fast};
      min-width: 80px;

      &:hover {
        border-color: ${theme.colors.primaryLight};
      }

      &.selected {
        border-color: ${theme.colors.primary};
        background: ${theme.colors.primaryBg};
        color: ${theme.colors.primary};
      }

      .day {
        font-size: ${theme.fontSizes.xs};
        color: ${theme.colors.textMuted};
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .date-num {
        font-size: ${theme.fontSizes.lg};
        font-weight: 700;
        color: ${theme.colors.text};
        margin-top: 2px;
      }

      &.selected .day, &.selected .date-num {
        color: ${theme.colors.primary};
      }
    }
  }

  .time-section {
    margin-bottom: ${theme.spacing.lg};

    h4 {
      font-family: ${theme.fonts.heading};
      font-size: ${theme.fontSizes.sm};
      font-weight: 600;
      color: ${theme.colors.textSecondary};
      margin: 0 0 ${theme.spacing.md};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;

      .count {
        font-size: 11px;
        background: ${theme.colors.bgTertiary};
        padding: 2px 8px;
        border-radius: ${theme.radii.full};
        font-weight: 500;
      }
    }

    .slot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 8px;
    }

    .slot-chip {
      padding: 10px;
      border-radius: ${theme.radii.md};
      border: 1.5px solid ${theme.colors.border};
      background: white;
      cursor: pointer;
      text-align: center;
      font-size: ${theme.fontSizes.sm};
      font-weight: 500;
      color: ${theme.colors.text};
      transition: all ${theme.transitions.fast};

      &:hover {
        border-color: ${theme.colors.primary};
        background: ${theme.colors.primaryBg};
        color: ${theme.colors.primary};
      }

      &.selected {
        border-color: ${theme.colors.primary};
        background: ${theme.colors.primary};
        color: white;
      }

      &.disabled {
        opacity: 0.4;
        cursor: not-allowed;
        background: ${theme.colors.bgTertiary};
        &:hover {
          border-color: ${theme.colors.border};
          background: ${theme.colors.bgTertiary};
          color: ${theme.colors.text};
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: ${theme.spacing['2xl']} ${theme.spacing.base};
    color: ${theme.colors.textMuted};
    font-size: ${theme.fontSizes.sm};

    .emoji {
      font-size: 40px;
      margin-bottom: ${theme.spacing.md};
    }
  }

  .loading {
    text-align: center;
    padding: ${theme.spacing.xl};
    color: ${theme.colors.textMuted};
  }
`;

interface SlotSelectorProps {
  doctorId: string;
  selectedSlot: DoctorSlot | null;
  onSlotSelect: (slot: DoctorSlot) => void;
  disabledSlotIds?: string[];
}

export default function SlotSelector({
  doctorId,
  selectedSlot,
  onSlotSelect,
  disabledSlotIds = [],
}: SlotSelectorProps) {
  const dates = getNextNDates(7);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const { data: grouped, isLoading } = useSlots(doctorId, selectedDate);

  const formatDateChip = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      day: isToday(dateStr) ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      num: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
    };
  };

  const sections = [
    { key: 'morning', label: '🌅 Morning', icon: '☀️' },
    { key: 'afternoon', label: '🌤 Afternoon', icon: '🌤' },
    { key: 'evening', label: '🌙 Evening', icon: '🌙' },
  ] as const;

  const totalSlots = grouped
    ? grouped.morning.length + grouped.afternoon.length + grouped.evening.length
    : 0;

  return (
    <div css={styles}>
      <div className="date-strip">
        {dates.map((date) => {
          const formatted = formatDateChip(date);
          return (
            <button
              key={date}
              className={`date-chip ${date === selectedDate ? 'selected' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="day">{formatted.day}</div>
              <div className="date-num">{formatted.num}</div>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="loading">Loading available slots...</div>
      ) : totalSlots === 0 ? (
        <div className="empty-state">
          <div className="emoji">📅</div>
          No slots available for {formatDate(selectedDate)}
        </div>
      ) : (
        sections.map(({ key, label }) => {
          const slots = grouped?.[key] || [];
          if (slots.length === 0) return null;

          return (
            <div key={key} className="time-section">
              <h4>
                {label}
                <span className="count">{slots.length} slots</span>
              </h4>
              <div className="slot-grid">
                {slots.map((slot) => {
                  const isDisabled = disabledSlotIds.includes(slot.id);
                  const isSelected = selectedSlot?.id === slot.id;

                  return (
                    <button
                      key={slot.id}
                      className={`slot-chip ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && onSlotSelect(slot)}
                      disabled={isDisabled}
                    >
                      {formatTime(slot.startTime)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
