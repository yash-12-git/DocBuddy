/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { theme } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers } from '@/services/admin.service';
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const pageStyles = css`
  h1 { font-family: ${theme.fonts.heading}; font-size: ${theme.fontSizes['2xl']}; font-weight: 700; margin-bottom: ${theme.spacing.xl}; }

  .count { font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textSecondary}; margin-bottom: ${theme.spacing.lg}; }

  .user-list { display: flex; flex-direction: column; gap: ${theme.spacing.md}; }

  .user-card {
    background: white; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.xl};
    padding: ${theme.spacing.lg}; display: flex; align-items: center; justify-content: space-between;

    .user-info {
      .uid { font-weight: 600; font-size: ${theme.fontSizes.sm}; font-family: ${theme.fonts.mono}; }
      .meta { font-size: 12px; color: ${theme.colors.textSecondary}; margin-top: 4px; }
    }

    .user-stats {
      display: flex; gap: ${theme.spacing.xl}; text-align: center;

      .stat {
        .val { font-weight: 700; font-size: ${theme.fontSizes.lg}; }
        .label { font-size: 11px; color: ${theme.colors.textMuted}; text-transform: uppercase; letter-spacing: 0.3px; }
      }
    }
  }

  .empty { text-align: center; padding: ${theme.spacing['2xl']}; color: ${theme.colors.textMuted}; }
`;

export default function AdminUsersPage() {
  const { user } = useAuth();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAllUsers,
    enabled: !!user,
    staleTime: 30_000,
  });

  return (
    <div css={pageStyles}>
      <h1>Users</h1>

      {users && <div className="count">{users.length} user{users.length !== 1 ? 's' : ''} (from orders)</div>}

      {isLoading ? <div className="empty">Loading...</div> : !users?.length ? (
        <div className="empty">No users found. Users appear here once they place orders.</div>
      ) : (
        <div className="user-list">
          {users.map((u: any) => (
            <div key={u.uid} className="user-card">
              <div className="user-info">
                <div className="uid">{u.uid.length > 24 ? u.uid.slice(0, 24) + '...' : u.uid}</div>
                <div className="meta">{u.email}</div>
              </div>
              <div className="user-stats">
                <div className="stat">
                  <div className="val">{u.totalOrders}</div>
                  <div className="label">Orders</div>
                </div>
                <div className="stat">
                  <div className="val">{formatCurrency(u.totalSpent)}</div>
                  <div className="label">Spent</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
