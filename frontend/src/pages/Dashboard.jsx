import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import { LoadingPage } from '../components/Spinner';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('posted');
  const [postedTasks, setPosted]  = useState([]);
  const [acceptedTasks, setAccepted] = useState([]);
  const [myApps, setMyApps]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [walletBalance, setWallet] = useState(null);

  useEffect(() => {
    fetchAll();

    const handleWalletUpdate = () => fetchAll();
    window.addEventListener('wallet-updated', handleWalletUpdate);
    
    return () => {
      window.removeEventListener('wallet-updated', handleWalletUpdate);
    };
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [postedRes, acceptedRes, appsRes, walletRes] = await Promise.all([
        api.get('/tasks/my/created'),
        api.get('/tasks/my/accepted'),
        api.get('/applications/my'),
        api.get('/wallet/balance'),
      ]);
      setPosted(postedRes.data.data?.tasks || []);
      setAccepted(acceptedRes.data.data?.tasks || []);
      setMyApps(appsRes.data.data?.applications || []);
      setWallet(walletRes.data.data?.wallet_balance ?? null);
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return <div className="page-wrapper"><LoadingPage /></div>;

  const postedCompleted = postedTasks.filter(t => t.status === 'COMPLETED').length;
  const earned = acceptedTasks.filter(t => t.status === 'COMPLETED').reduce((s, t) => s + parseFloat(t.price || 0), 0);

  const TABS = [
    { key: 'posted',   label: `Posted (${postedTasks.length})` },
    { key: 'accepted', label: `Accepted (${acceptedTasks.length})` },
    { key: 'applied',  label: `Applied (${myApps.length})` },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 6 }}>
              Hey, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-muted">Here's your task dashboard</p>
          </div>
          <Link to="/create-task" className="btn btn-primary">+ Post New Task</Link>
        </div>

        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <StatCard icon="📋" value={postedTasks.length} label="Tasks Posted" color="var(--accent)" />
          <StatCard icon="✅" value={postedCompleted} label="Tasks Completed" color="var(--green)" />
          <StatCard icon="🤝" value={acceptedTasks.length} label="Tasks Accepted" color="var(--amber)" />
          <StatCard icon="💳" value={walletBalance !== null ? `₹${parseFloat(walletBalance).toLocaleString()}` : '—'} label="Wallet Balance" color="var(--accent-light)" />
        </div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.key} className={`tab-btn${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'posted' && (
          <TaskTable tasks={postedTasks} emptyText="You haven't posted any tasks yet." />
        )}
        {activeTab === 'accepted' && (
          <TaskTable tasks={acceptedTasks} emptyText="You haven't been accepted for any tasks yet." showCreator />
        )}
        {activeTab === 'applied' && (
          <ApplicationTable apps={myApps} />
        )}
      </div>
    </div>
  );
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

function TaskTable({ tasks, emptyText, showCreator }) {
  if (tasks.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon">📋</div>
      <h3>Nothing here yet</h3>
      <p>{emptyText}</p>
    </div>
  );
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            {showCreator && <th>Posted By</th>}
            <th>Price</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.task_id}>
              <td style={{ maxWidth: 260 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }} className="truncate">{t.title}</div>
                {t.description && <div className="text-xs text-muted truncate">{t.description}</div>}
              </td>
              {showCreator && <td>{t.creator_name || '—'}</td>}
              <td style={{ fontWeight: 700, color: 'var(--green)' }}>₹{parseFloat(t.price || 0).toLocaleString()}</td>
              <td><StatusBadge status={t.status} /></td>
              <td className="text-sm text-muted">{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
              <td>
                <Link to={`/tasks/${t.task_id}`} className="btn btn-ghost btn-sm">View →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApplicationTable({ apps }) {
  if (apps.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon">🤝</div>
      <h3>No applications yet</h3>
      <p>Browse tasks and apply to start earning.</p>
      <Link to="/browse" className="btn btn-primary">Browse Tasks</Link>
    </div>
  );
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Status</th>
            <th>Applied On</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {apps.map(a => (
            <tr key={a.application_id}>
              <td style={{ fontWeight: 600 }}>{a.title || `Task #${a.task_id}`}</td>
              <td><span className={`badge badge-${(a.status || '').toLowerCase()}`}>{a.status}</span></td>
              <td className="text-sm text-muted">{new Date(a.applied_at).toLocaleDateString('en-IN')}</td>
              <td>
                <Link to={`/tasks/${a.task_id}`} className="btn btn-ghost btn-sm">View →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
