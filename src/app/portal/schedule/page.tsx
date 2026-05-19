/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorSchedules, saveDoctorSchedule, deleteDoctorSchedule } from '@/services/portal.service';
import { getClientDb } from '@/lib/firebase/client';
import { doc, writeBatch, Timestamp } from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getNextNDates } from '@/lib/utils';

const S = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; margin-bottom: ${theme.spacing.lg};
    @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; margin-bottom: ${theme.spacing.xl}; } }

  .card { background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.base}; margin-bottom: ${theme.spacing.base};
    @media (min-width: 768px) { padding: ${theme.spacing.xl}; margin-bottom: ${theme.spacing.lg}; }
    h2 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.base}; font-weight: 700; margin: 0 0 ${theme.spacing.base};
      @media (min-width: 768px) { font-size: ${theme.fontSizes.lg}; margin-bottom: ${theme.spacing.lg}; } }
  }

  .schedule-row { display: flex; align-items: center; gap: ${theme.spacing.sm}; padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.colors.bgSecondary}; border-radius: ${theme.radii.md}; margin-bottom: ${theme.spacing.sm}; flex-wrap: wrap;
    .day { font-weight: 600; font-size: ${theme.fontSizes.sm}; min-width: 80px; }
    .time { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; }
    .del-btn { padding: 4px 10px; border: 1px solid rgba(239,68,68,0.3); background: white; color: ${theme.colors.error};
      border-radius: ${theme.radii.sm}; font-size: 12px; margin-left: auto; &:hover { background: ${theme.colors.errorBg}; } }
  }

  .add-form { display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm}; align-items: flex-end; padding: ${theme.spacing.base};
    background: ${theme.colors.bgSecondary}; border-radius: ${theme.radii.md}; margin-top: ${theme.spacing.base};
    .form-group { flex: 1; min-width: 100px;
      label { display: block; font-size: 11px; font-weight: 500; margin-bottom: 4px; color: ${theme.colors.textSecondary}; }
      select, input { padding: 8px 10px; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.sm}; font-size: 16px; width: 100%; outline: none; }
    }
    .add-btn { padding: 8px 16px; background: ${theme.colors.primary}; color: white; border: none;
      border-radius: ${theme.radii.md}; font-weight: 600; font-size: ${theme.fontSizes.sm}; white-space: nowrap; }
  }

  .generate-section { margin-top: ${theme.spacing.base}; padding: ${theme.spacing.base}; background: ${theme.colors.infoBg};
    border-radius: ${theme.radii.md}; border: 1px solid rgba(59,130,246,0.15);
    h3 { font-size: ${theme.fontSizes.sm}; font-weight: 700; margin-bottom: ${theme.spacing.sm}; }
    p { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; margin-bottom: ${theme.spacing.sm}; }
    .gen-btn { padding: 10px 20px; background: ${theme.colors.info}; color: white; border: none; border-radius: ${theme.radii.md}; font-weight: 600; width: 100%;
      @media (min-width: 480px) { width: auto; }
      &:disabled { opacity: 0.5; cursor: not-allowed; } }
  }

  .toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); padding: 12px 24px;
    background: ${theme.colors.success}; color: white; border-radius: ${theme.radii.md};
    font-weight: 600; font-size: ${theme.fontSizes.sm}; z-index: 1000; }
`;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SchedulePage() {
  const { user } = useAuth();
  const userId = (user as any)?.uid;
  const qc = useQueryClient();
  const { data: schedules, isLoading } = useQuery({ queryKey: ['doctor-schedules', userId], queryFn: () => getDoctorSchedules(userId), enabled: !!userId });

  const [newDay, setNewDay] = useState('1');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('13:00');
  const [newDuration, setNewDuration] = useState('30');
  const [generating, setGenerating] = useState(false);
  const [showToast, setShowToast] = useState('');

  const handleAdd = async () => {
    if (!userId) return;
    await saveDoctorSchedule(userId, { doctorId: userId, dayOfWeek: Number(newDay) as any, startTime: newStart, endTime: newEnd, slotDuration: Number(newDuration), isActive: true, effectiveFrom: Timestamp.now(), effectiveTo: null });
    qc.invalidateQueries({ queryKey: ['doctor-schedules'] });
    setShowToast('Schedule added'); setTimeout(() => setShowToast(''), 3000);
  };

  const handleDelete = async (id: string) => { if (!userId) return; await deleteDoctorSchedule(userId, id); qc.invalidateQueries({ queryKey: ['doctor-schedules'] }); };

  const generateSlots = async () => {
    if (!userId || !schedules?.length) return; setGenerating(true);
    const db = getClientDb(); const dates = getNextNDates(7); let total = 0;
    for (const dateStr of dates) {
      const dow = new Date(dateStr + 'T00:00:00').getDay();
      const dayScheds = schedules.filter(s => s.dayOfWeek === dow && s.isActive);
      for (const schedule of dayScheds) {
        const [sH, sM] = schedule.startTime.split(':').map(Number);
        const [eH, eM] = schedule.endTime.split(':').map(Number);
        let cur = sH * 60 + sM; const end = eH * 60 + eM; const batch = writeBatch(db);
        while (cur + schedule.slotDuration <= end) {
          const sh = Math.floor(cur / 60); const sm = cur % 60; cur += schedule.slotDuration;
          const eh = Math.floor(cur / 60); const em = cur % 60;
          const st = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
          const et = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
          const id = `slot_${userId}_${dateStr}_${st.replace(':', '')}`;
          batch.set(doc(db, 'doctorSlots', id), { id, doctorId: userId, date: dateStr, startTime: st, endTime: et, status: 'available', lockExpiry: null, lockedBy: null, bookedBy: null, orderId: null, createdAt: Timestamp.now() }, { merge: true });
          total++;
        }
        await batch.commit();
      }
    }
    setGenerating(false); setShowToast(`Generated ${total} slots`); setTimeout(() => setShowToast(''), 4000);
  };

  return (
    <div css={S}>
      <h1>Schedule</h1>
      <div className="card">
        <h2>Weekly Schedule</h2>
        {isLoading ? <p>Loading...</p> : !schedules?.length ? <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)' }}>No schedules yet. Add below.</p> :
          schedules.map(s => (
            <div key={s.id} className="schedule-row">
              <span className="day">{DAYS[s.dayOfWeek]}</span>
              <span className="time">{s.startTime} – {s.endTime} ({s.slotDuration}min)</span>
              <button className="del-btn" onClick={() => handleDelete(s.id)}>Delete</button>
            </div>
          ))
        }
        <div className="add-form">
          <div className="form-group"><label>Day</label><select value={newDay} onChange={e => setNewDay(e.target.value)}>{DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></div>
          <div className="form-group"><label>Start</label><input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} /></div>
          <div className="form-group"><label>End</label><input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} /></div>
          <div className="form-group"><label>Duration</label><select value={newDuration} onChange={e => setNewDuration(e.target.value)}><option value="15">15 min</option><option value="20">20 min</option><option value="30">30 min</option><option value="45">45 min</option></select></div>
          <button className="add-btn" onClick={handleAdd}>+ Add</button>
        </div>
      </div>
      <div className="card">
        <div className="generate-section">
          <h3>🗓 Generate Slots</h3>
          <p>Create slots for the next 7 days from your schedules above.</p>
          <button className="gen-btn" onClick={generateSlots} disabled={generating || !schedules?.length}>{generating ? 'Generating...' : 'Generate Slots (7 Days)'}</button>
        </div>
      </div>
      {showToast && <div className="toast">✓ {showToast}</div>}
    </div>
  );
}
