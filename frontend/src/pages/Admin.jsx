import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { LoadingPage } from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

export default function Admin() {
  const [tab, setTab]       = useState('dashboard');
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [tasks, setTasks]   = useState([]);
  const [txns, setTxns]     = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activitySummary, setActivitySummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Check if password is already verified in sessionStorage
    const verified = sessionStorage.getItem('adminPasswordVerified');
    const password = sessionStorage.getItem('adminPassword');
    if (verified && password) {
      setAdminPassword(password);
      setPasswordVerified(true);
      fetchAll(password);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setLoading(true);

    try {
      const res = await api.post('/admin/verify-password', { adminPassword });
      if (res.data.success) {
        setPasswordVerified(true);
        sessionStorage.setItem('adminPasswordVerified', 'true');
        sessionStorage.setItem('adminPassword', adminPassword);
        fetchAll(adminPassword);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Invalid password');
      setLoading(false);
    }
  };

  const fetchAll = async (password) => {
    setLoading(true);
    try {
      const config = {
        headers: {
          'x-admin-password': password,
        },
      };

      const endpoints = [
        { key: 'stats', url: '/admin/dashboard' },
        { key: 'users', url: '/admin/users' },
        { key: 'tasks', url: '/admin/tasks' },
        { key: 'txns', url: '/admin/transactions' },
        { key: 'reviews', url: '/admin/reviews' },
        { key: 'analytics', url: '/admin/analytics' },
        { key: 'activities', url: '/admin/activities?limit=50' },
        { key: 'activitySummary', url: '/admin/activity-summary' },
      ];

      const results = await Promise.allSettled(
        endpoints.map(e => api.get(e.url, config))
      );

      // Process results
      results.forEach((res, i) => {
        const key = endpoints[i].key;
        if (res.status === 'fulfilled') {
          const data = res.value.data.data;
          if (key === 'stats') setStats(data);
          if (key === 'users') setUsers(data?.users || []);
          if (key === 'tasks') setTasks(data?.tasks || []);
          if (key === 'txns') setTxns(data?.transactions || []);
          if (key === 'reviews') setReviews(data?.reviews || []);
          if (key === 'analytics') setAnalytics(data);
          if (key === 'activities') setActivities(data?.activities || []);
          if (key === 'activitySummary') setActivitySummary(data);
        } else {
          console.error(`Admin fetch error for ${key}:`, res.reason);
          // Handle auth error
          if (res.reason.response?.status === 401) {
             throw res.reason;
          }
        }
      });
    } catch (err) {
      console.error('Admin fetch error', err);
      if (err.response?.status === 401) {
        setPasswordError('Admin session expired. Please enter password again.');
        setPasswordVerified(false);
        sessionStorage.removeItem('adminPasswordVerified');
        sessionStorage.removeItem('adminPassword');
      }
    }
    finally { setLoading(false); }
  };

  if (!passwordVerified) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 400, margin: '100px auto' }}>
          <div className="card">
            <div style={{
              padding: '4px 12px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--red)', display: 'inline-block', marginBottom: 16
            }}>ADMIN ACCESS</div>
            <h2 style={{ marginBottom: 8 }}>Admin Panel</h2>
            <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Enter the admin password to access the admin panel</p>

            <form onSubmit={verifyPassword}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Admin Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Enter admin password"
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', fontSize: '1rem',
                    borderColor: passwordError ? 'var(--red)' : 'var(--border)',
                  }}
                />
              </div>

              {passwordError && (
                <div style={{
                  padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 'var(--radius)', color: 'var(--red)', marginBottom: 16, fontSize: '0.9rem'
                }}>
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '10px 16px', background: 'var(--accent)',
                  color: 'white', border: 'none', borderRadius: 'var(--radius)',
                  fontSize: '1rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Verifying...' : 'Access Admin Panel'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="page-wrapper"><LoadingPage /></div>;

  const TABS = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'users',     label: `👤 Users (${users.length})` },
    { key: 'tasks',     label: `📋 Tasks (${tasks.length})` },
    { key: 'txns',      label: `💳 Transactions (${txns.length})` },
    { key: 'reviews',   label: `⭐ Reviews (${reviews.length})` },
    { key: 'activities', label: `📝 Activities (${activities.length})` },
    { key: 'analytics', label: '📈 Analytics' },
  ];

  const d = stats?.dashboard || {};
  const f = stats?.financials || {};

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              padding: '4px 12px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--red)',
            }}>ADMIN</div>
            <h1>Admin Panel</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p>Platform overview and management</p>
            <button
              onClick={() => {
                sessionStorage.removeItem('adminPasswordVerified');
                sessionStorage.removeItem('adminPassword');
                setPasswordVerified(false);
                setAdminPassword('');
              }}
              style={{
                padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 'var(--radius)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--red)',
                cursor: 'pointer', marginLeft: 'auto'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', padding: 4, borderRadius: 'var(--radius)', marginBottom: 28, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`}
              style={{ fontSize: '0.8rem', flex: 'none' }}
              onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* ── Dashboard ── */}
        {tab === 'dashboard' && (
          <div>
            <div className="grid-4" style={{ marginBottom: 28 }}>
              <StatCard icon="👤" value={d.total_users}       label="Total Users"       color="var(--accent-light)" />
              <StatCard icon="�" value={d.active_users}      label="Active Users"      color="var(--green)" />
              <StatCard icon="📋" value={d.total_tasks}       label="Total Tasks"       color="var(--accent)" />
              <StatCard icon="✅" value={d.completed_tasks}   label="Completed Tasks"   color="var(--green)" />
            </div>
            <div className="grid-4" style={{ marginBottom: 28 }}>
              <StatCard icon="⏳" value={d.pending_applications} label="Pending Apps"  color="var(--amber)" />
              <StatCard icon="📊" value={d.total_applications} label="Total Apps"  color="var(--accent-light)" />
              <StatCard icon="⭐" value={parseFloat(d.avg_rating || 0).toFixed(1)} label="Avg Rating"  color="var(--amber)" />
              <StatCard icon="📝" value={d.total_reviews}   label="Total Reviews"   color="var(--purple)" />
            </div>
            <div className="grid-2">
              <div className="card">
                <h3 className="heading-md" style={{ marginBottom: 16 }}>Tasks by Status</h3>
                <div className="flex-col gap-10">
                  {(stats?.tasks_by_status || []).map(s => (
                    <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <StatusBadge status={s.status} />
                      <span style={{ fontWeight: 700 }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="heading-md" style={{ marginBottom: 16 }}>Key Metrics</h3>
                <div className="flex-col gap-16">
                  <div>
                    <p className="text-xs text-muted" style={{ marginBottom: 4 }}>Application Acceptance Rate</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--green)' }}>
                      {parseFloat(stats?.metrics?.acceptance_rate || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted" style={{ marginBottom: 4 }}>Task Cancellation Rate</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-light)' }}>
                      {parseFloat(stats?.metrics?.cancellation_rate || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid-2" style={{ marginTop: 28 }}>
              <div className="card">
                <h3 className="heading-md" style={{ marginBottom: 16 }}>Financial Summary</h3>
                <div className="flex-col gap-16">
                  <div>
                    <p className="text-xs text-muted" style={{ marginBottom: 4 }}>Total Transacted</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--green)' }}>
                      ₹{parseFloat(f.total_transaction_amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted" style={{ marginBottom: 4 }}>Average Task Price</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-light)' }}>
                      ₹{parseFloat(f.average_task_price || 0).toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th>
                  <th>Tasks Created</th><th>Completed</th><th>Applications</th><th>Rating</th><th>Wallet</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.user_id}>
                    <td className="text-muted text-sm">#{u.user_id}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td className="text-sm">{u.email}</td>
                    <td className="text-sm">{u.phone || '—'}</td>
                    <td className="text-sm">{u.city || '—'}</td>
                    <td>{u.tasks_created}</td>
                    <td>{u.tasks_completed}</td>
                    <td>{u.applications_submitted}</td>
                    <td style={{ color: 'var(--amber)' }}>{u.avg_rating ? parseFloat(u.avg_rating).toFixed(1) + ' ★' : '—'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--green)' }}>₹{parseFloat(u.wallet_balance || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Tasks ── */}
        {tab === 'tasks' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Description</th><th>Creator</th><th>Worker</th>
                  <th>Price</th><th>Deadline</th><th>Location</th><th>Applications</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.task_id}>
                    <td className="text-muted text-sm">#{t.task_id}</td>
                    <td>
                      <Link to={`/tasks/${t.task_id}`} style={{ color: 'var(--accent-light)', fontWeight: 600 }}
                        className="truncate" >{t.title}</Link>
                    </td>
                    <td className="text-sm" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description || '—'}</td>
                    <td className="text-sm">{t.creator_name}</td>
                    <td className="text-sm text-muted">{t.performer_name || '—'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--green)' }}>₹{parseFloat(t.price || 0).toLocaleString()}</td>
                    <td className="text-sm">{t.deadline ? new Date(t.deadline).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="text-sm">{t.city || t.locality || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{t.total_applications} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({t.pending_applications} pending)</span></td>
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Transactions ── */}
        {tab === 'txns' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>ID</th><th>Task</th><th>Payer</th><th>Payee</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {txns.map(t => (
                  <tr key={t.transaction_id}>
                    <td className="text-muted text-sm">#{t.transaction_id}</td>
                    <td className="text-sm">{t.task_title}</td>
                    <td className="text-sm">{t.payer_name}</td>
                    <td className="text-sm">{t.payee_name}</td>
                    <td style={{ fontWeight: 700, color: 'var(--green)' }}>₹{parseFloat(t.amount || 0).toLocaleString()}</td>
                    <td><span className={`badge badge-${(t.status || '').toLowerCase()}`}>{t.status}</span></td>
                    <td className="text-sm text-muted">{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Reviews ── */}
        {tab === 'reviews' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>ID</th><th>Task</th><th>Reviewer</th><th>Reviewed</th><th>Rating</th><th>Comment</th><th>Date</th></tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.review_id}>
                    <td className="text-muted text-sm">#{r.review_id}</td>
                    <td className="text-sm">{r.task_title}</td>
                    <td className="text-sm">{r.reviewer_name}</td>
                    <td className="text-sm">{r.reviewed_user_name}</td>
                    <td style={{ color: 'var(--amber)' }}>{'★'.repeat(r.rating)}</td>
                    <td className="text-sm text-muted" style={{ maxWidth: 200 }}>{r.comment || '—'}</td>
                    <td className="text-sm text-muted">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Analytics ── */}
        {tab === 'analytics' && analytics && (
          <div className="flex-col gap-24">
            {/* Completion rate */}
            <div className="card">
              <h3 className="heading-md" style={{ marginBottom: 16 }}>Task Completion Rate</h3>
              <div style={{ fontSize: '3rem', fontWeight: 900 }} className="gradient-text">
                {parseFloat(analytics.completion_rate || 0).toFixed(1)}%
              </div>
            </div>

            {/* New users this month */}
            <div className="card">
              <h3 className="heading-md" style={{ marginBottom: 16 }}>Platform Growth</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <p className="text-xs text-muted" style={{ marginBottom: 4 }}>New Users (Last 30 Days)</p>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-light)' }}>
                    {analytics.new_users_month || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue per day */}
            <div className="card">
              <h3 className="heading-md" style={{ marginBottom: 16 }}>Revenue Trend (Last 30 Days)</h3>
              {analytics.revenue_per_day?.length === 0 ? (
                <p className="text-muted text-sm">No revenue data yet.</p>
              ) : (
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 150, overflowX: 'auto', paddingBottom: 20 }}>
                  {analytics.revenue_per_day?.map((d, i) => {
                    const max = Math.max(...analytics.revenue_per_day.map(x => x.total_revenue || 0));
                    const h = max ? ((d.total_revenue || 0) / max) * 100 : 0;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 24 }}
                        title={`${d.date}: ₹${(d.total_revenue || 0).toLocaleString()}`}>
                        <div style={{ width: 16, height: `${h}%`, minHeight: 4, background: 'var(--green)', borderRadius: 3, transition: 'height 0.3s' }} />
                        <span className="text-xs text-muted" style={{ fontSize: '0.6rem', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                          {d.date?.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top earners */}
            <div className="card">
              <h3 className="heading-md" style={{ marginBottom: 16 }}>Top 5 Earners</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Rank</th><th>Name</th><th>Tasks Done</th><th>Total Earned</th><th>Avg Rating</th></tr>
                  </thead>
                  <tbody>
                    {(analytics.top_users || []).map((u, i) => (
                      <tr key={u.user_id}>
                        <td style={{ fontWeight: 700, color: i === 0 ? 'var(--amber)' : i === 1 ? 'var(--text-secondary)' : i === 2 ? '#cd7f32' : 'var(--text-muted)' }}>
                          #{i + 1}
                        </td>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.tasks_completed}</td>
                        <td style={{ fontWeight: 700, color: 'var(--green)' }}>₹{parseFloat(u.total_earnings || 0).toLocaleString()}</td>
                        <td style={{ color: 'var(--amber)' }}>{u.avg_rating ? parseFloat(u.avg_rating).toFixed(1) + ' ★' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tasks per day */}
            <div className="card">
              <h3 className="heading-md" style={{ marginBottom: 16 }}>Tasks Posted (Last 30 Days)</h3>
              {analytics.tasks_per_day?.length === 0 ? (
                <p className="text-muted text-sm">No data yet.</p>
              ) : (
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 120, overflowX: 'auto', paddingBottom: 8 }}>
                  {analytics.tasks_per_day?.map((d, i) => {
                    const max = Math.max(...analytics.tasks_per_day.map(x => x.count));
                    const h = max ? (d.count / max) * 100 : 0;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 24 }}
                        title={`${d.date}: ${d.count} tasks`}>
                        <div style={{ width: 16, height: `${h}%`, minHeight: 4, background: 'var(--accent)', borderRadius: 3, transition: 'height 0.3s' }} />
                        <span className="text-xs text-muted" style={{ fontSize: '0.6rem', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                          {d.date?.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Activities ── */}
        {tab === 'activities' && (
          <div className="flex-col gap-24">
            {/* Activity Summary */}
            {activitySummary && (
              <div className="card">
                <h3 className="heading-md" style={{ marginBottom: 16 }}>User Activity Summary (Last 7 Days)</h3>
                <div className="grid-2" style={{ gap: 20 }}>
                  {(activitySummary.activity_summary || []).map(s => (
                    <div key={s.action} style={{
                      padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div className="text-sm" style={{ opacity: 0.7, marginBottom: 4 }}>{s.action}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.count}</div>
                      </div>
                      <div style={{ fontSize: '2rem', opacity: 0.5 }}>
                        {s.action === 'LOGIN' ? '🔐' : s.action === 'REGISTER' ? '👤' : s.action === 'CREATE_TASK' ? '📝' : '📊'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activities */}
            <div className="card">
              <h3 className="heading-md" style={{ marginBottom: 16 }}>Recent User Activities</h3>
              {activities.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <h3>No activities yet</h3>
                  <p>User activities will appear here</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>User</th><th>Action</th><th>Resource</th><th>Description</th><th>Date & Time</th></tr>
                    </thead>
                    <tbody>
                      {activities.map(a => (
                        <tr key={a.activity_id}>
                          <td style={{ fontWeight: 600 }}>
                            <div>{a.user_name || 'Unknown'}</div>
                            <div className="text-xs text-muted">{a.user_email || ''}</div>
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 10px', background: getActionColor(a.action), color: 'white',
                              borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600
                            }}>
                              {a.action}
                            </span>
                          </td>
                          <td className="text-sm">{a.resource_type || '—'}</td>
                          <td className="text-sm">{a.description || '—'}</td>
                          <td className="text-xs text-muted">{new Date(a.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getActionColor(action) {
  const colors = {
    'LOGIN': '#6c63ff',
    'REGISTER': '#22d3a0',
    'CREATE_TASK': '#f59e0b',
    'UPDATE_PROFILE': '#8b5cf6',
    'CREATE_APPLICATION': '#ec4899',
    'CREATE_REVIEW': '#06b6d4',
    'UPDATE_STATUS': '#10b981',
    'VIEW': '#64748b',
  };
  return colors[action] || '#64748b';
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-value" style={{ color }}>{value}</div>
          <div className="stat-label">{label}</div>
        </div>
        <div className="stat-icon">{icon}</div>
      </div>
    </div>
  );
}
