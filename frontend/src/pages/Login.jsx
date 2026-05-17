import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { Spinner } from '../components/Spinner';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.data, data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(108,99,255,0.08)', top: -100, right: -100 }} />
        <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(34,211,160,0.06)', bottom: 50, left: -80 }} />
      </div>

      <div className="container-sm" style={{ width: '100%', paddingTop: 40, paddingBottom: 40 }}>
        <div className="animate-slide-up">
          {/* Header */}
          <div className="text-center mb-32">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #6c63ff, #22d3a0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1.1rem', color: '#fff',
              }}>M</div>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem' }}>Mesh</span>
            </Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 8 }}>Welcome back</h1>
            <p className="text-muted">Sign in to your account to continue</p>
          </div>

          <div className="card" style={{ padding: 32 }}>
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="flex-col gap-20">
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input name="email" type="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input name="password" type="password" className="form-input" placeholder="Your password"
                  value={form.password} onChange={handleChange} required />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <Spinner /> : 'Sign In'}
              </button>
            </form>

            <div className="divider" />
            <p className="text-center text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Create one free</Link>
            </p>
          </div>

          <p className="text-center text-xs text-muted mt-24" style={{ opacity: 0.5 }}>
            Demo: prarthana@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}
