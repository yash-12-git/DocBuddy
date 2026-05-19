/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getClientDb } from '@/lib/firebase/client';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const S = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes.xl}; font-weight: 700; margin-bottom: ${theme.spacing.lg};
    @media (min-width: 768px) { font-size: ${theme.fontSizes['2xl']}; margin-bottom: ${theme.spacing.xl}; } }

  .summary { display: flex; gap: ${theme.spacing.md}; margin-bottom: ${theme.spacing.lg}; flex-wrap: wrap;
    .chip { padding: 6px 14px; border-radius: ${theme.radii.full}; font-size: ${theme.fontSizes.sm}; font-weight: 600;
      background: ${theme.colors.primaryBg}; color: ${theme.colors.primary}; }
  }

  .list { display: flex; flex-direction: column; gap: ${theme.spacing.sm}; }

  .user-card {
    background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.base};
    @media (min-width: 768px) { padding: ${theme.spacing.lg}; }

    .top { display: flex; gap: ${theme.spacing.md}; align-items: center; margin-bottom: ${theme.spacing.sm}; }

    .avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: ${theme.colors.primaryBg}; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; color: ${theme.colors.primary}; flex-shrink: 0;
    }

    .info { flex: 1; min-width: 0;
      .name { font-weight: 700; font-size: ${theme.fontSizes.sm}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .email { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textSecondary}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }

    .role-badge {
      padding: 3px 10px; border-radius: ${theme.radii.full}; font-size: 11px; font-weight: 600; text-transform: uppercase;
      white-space: nowrap; flex-shrink: 0;
      &.admin { background: #FFFBEB; color: #D97706; }
      &.doctor { background: #EFF6FF; color: #3B82F6; }
      &.user { background: #F1F5F9; color: #64748B; }
    }

    .details { display: flex; gap: ${theme.spacing.md}; flex-wrap: wrap; font-size: ${theme.fontSizes.xs};
      color: ${theme.colors.textSecondary}; }

    .actions { display: flex; gap: 6px; margin-top: ${theme.spacing.sm}; padding-top: ${theme.spacing.sm};
      border-top: 1px solid ${theme.colors.borderLight}; flex-wrap: wrap;
      select { padding: 5px 10px; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.sm};
        font-size: 12px; background: white; outline: none; }
      button { padding: 5px 12px; border-radius: ${theme.radii.md}; font-size: 12px; font-weight: 600;
        background: ${theme.colors.primary}; color: white; border: none;
        &:disabled { opacity: 0.5; } }
    }
  }

  .empty { text-align: center; padding: ${theme.spacing.xl}; color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.sm}; }
`;

async function fetchAllUsers() {
  const db = getClientDb();
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [roleChanges, setRoleChanges] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAllUsers,
    enabled: !!user,
    staleTime: 15_000,
  });

  const handleRoleChange = async (userId: string) => {
    const newRole = roleChanges[userId];
    if (!newRole) return;
    setSavingId(userId);
    try {
      const db = getClientDb();
      await updateDoc(doc(db, 'users', userId), { role: newRole, updatedAt: Timestamp.now() });
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (err) { console.error(err); }
    setSavingId(null);
  };

  const counts = users ? {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    doctors: users.filter(u => u.role === 'doctor').length,
    users: users.filter(u => u.role === 'user' || !u.role).length,
  } : { total: 0, admins: 0, doctors: 0, users: 0 };

  return (
    <div css={S}>
      <h1>User Management</h1>

      <div className="summary">
        <span className="chip">Total: {counts.total}</span>
        <span className="chip" style={{ background: '#FFFBEB', color: '#D97706' }}>Admins: {counts.admins}</span>
        <span className="chip" style={{ background: '#EFF6FF', color: '#3B82F6' }}>Doctors: {counts.doctors}</span>
        <span className="chip" style={{ background: '#F1F5F9', color: '#64748B' }}>Users: {counts.users}</span>
      </div>

      {isLoading ? <div className="empty">Loading users...</div>
      : !users?.length ? <div className="empty">No users found</div>
      : (
        <div className="list">
          {users.map(u => {
            const initials = (u.displayName || u.email || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            const role = u.role || 'user';
            return (
              <div key={u.id} className="user-card">
                <div className="top">
                  <div className="avatar">{initials}</div>
                  <div className="info">
                    <div className="name">{u.displayName || 'No name'}</div>
                    <div className="email">{u.email}</div>
                  </div>
                  <span className={`role-badge ${role}`}>{role}</span>
                </div>
                <div className="details">
                  {u.phone && <span>📱 {u.phone}</span>}
                  {u.gender && <span>👤 {u.gender}</span>}
                  {u.dateOfBirth && <span>🎂 {u.dateOfBirth}</span>}
                  <span>📅 Joined {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'Unknown'}</span>
                </div>
                <div className="actions">
                  <select value={roleChanges[u.id] || role} onChange={e => setRoleChanges(p => ({ ...p, [u.id]: e.target.value }))}>
                    <option value="user">User</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => handleRoleChange(u.id)} disabled={savingId === u.id || !roleChanges[u.id] || roleChanges[u.id] === role}>
                    {savingId === u.id ? '...' : 'Update'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
