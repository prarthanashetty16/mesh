import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { LoadingPage } from '../components/Spinner';

export default function Wallet() {
  const [data, setData]     = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('summary');

  useEffect(() => {
    fetchWallet();

    const handleWalletUpdate = () => fetchWallet();
    window.addEventListener('wallet-updated', handleWalletUpdate);
    
    return () => {
      window.removeEventListener('wallet-updated', handleWalletUpdate);
    };
  }, []);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const [transRes, balRes] = await Promise.all([
        api.get('/wallet/transactions'),
        api.get('/wallet/balance'),
      ]);
      setData(transRes.data.data);
      setBalance(balRes.data.data.wallet_balance);
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return <div className="page-wrapper"><LoadingPage /></div>;

  const summary = data?.summary || {};
  const paid    = data?.paid_transactions || [];
  const earned  = data?.earned_transactions || [];

  const TABS = [
    { key: 'summary', label: 'Summary' },
    { key: 'earned',  label: `Earned (${earned.length})` },
    { key: 'paid',    label: `Paid (${paid.length})` },
  ];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="page-header">
          <h1>My Wallet</h1>
          <p>Track your earnings and payments</p>
        </div>

        {/* Balance hero */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(34,211,160,0.1))',
          border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-xl)',
          padding: '40px 32px', marginBottom: 32, textAlign: 'center',
        }}>
          <p className="text-sm text-muted" style={{ marginBottom: 8 }}>Current Balance</p>
          <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'Syne', marginBottom: 16 }} className="gradient-text">
            ₹{parseFloat(balance || 0).toLocaleString()}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green)' }}>
                ₹{parseFloat(data?.summary?.total_earned || 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted">Total Earned</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--red)' }}>
                ₹{parseFloat(data?.summary?.total_paid || 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted">Total Paid</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* Summary */}
        {tab === 'summary' && (
          <div className="grid-2" style={{ gap: 20 }}>
            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Tasks Completed (as worker)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>{earned.length}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Tasks Paid (as creator)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-light)' }}>{paid.length}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Average Earned per Task</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>
                ₹{earned.length ? (parseFloat(summary.total_earned || 0) / earned.length).toFixed(0) : '0'}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Average Paid per Task</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-light)' }}>
                ₹{paid.length ? (parseFloat(summary.total_paid || 0) / paid.length).toFixed(0) : '0'}
              </div>
            </div>
          </div>
        )}

        {/* Earned transactions */}
        {tab === 'earned' && (
          <TransactionTable transactions={earned} type="earned" />
        )}

        {/* Paid transactions */}
        {tab === 'paid' && (
          <TransactionTable transactions={paid} type="paid" />
        )}
      </div>
    </div>
  );
}

function TransactionTable({ transactions, type }) {
  if (transactions.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon">{type === 'earned' ? '💰' : '💳'}</div>
      <h3>No transactions yet</h3>
      <p>{type === 'earned' ? 'Complete tasks to start earning.' : 'Post and complete tasks to see payments.'}</p>
    </div>
  );
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>{type === 'earned' ? 'Paid By' : 'Paid To'}</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.transaction_id}>
              <td>
                <Link to={`/tasks/${t.task_id}`} style={{ color: 'var(--accent-light)', fontWeight: 600 }}>
                  {t.task_title || `Task #${t.task_id}`}
                </Link>
              </td>
              <td className="text-sm">{type === 'earned' ? t.payer_name : t.payee_name}</td>
              <td style={{ fontWeight: 700, color: type === 'earned' ? 'var(--green)' : 'var(--red)' }}>
                {type === 'earned' ? '+' : '-'}₹{parseFloat(t.amount || 0).toLocaleString()}
              </td>
              <td><span className={`badge badge-${(t.status || '').toLowerCase()}`}>{t.status}</span></td>
              <td className="text-sm text-muted">{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
