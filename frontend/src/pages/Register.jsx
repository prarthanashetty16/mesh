import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { Spinner } from '../components/Spinner';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    address_line: '', landmark: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login({ user_id: data.data.user_id, email: data.data.email, name: form.name }, data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="glow-orb" style={{ width: 350, height: 350, background: 'rgba(34,211,160,0.07)', top: -80, left: -80 }} />
        <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(108,99,255,0.07)', bottom: 0, right: -60 }} />
      </div>

      <div className="container-sm" style={{ width: '100%', paddingTop: 40, paddingBottom: 40 }}>
        <div className="animate-slide-up">
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 8 }}>Create your account</h1>
            <p className="text-muted">Join Mesh and start posting or completing tasks</p>
          </div>

          <div className="card" style={{ padding: 32 }}>
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="flex-col gap-16">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full name *</label>
                  <input name="name" className="form-input" placeholder="Your name"
                    value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input name="phone" className="form-input" placeholder="10-digit number"
                    value={form.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email address *</label>
                <input name="email" type="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input name="password" type="password" className="form-input" placeholder="Minimum 6 characters"
                  value={form.password} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input name="address_line" className="form-input" placeholder="House/Flat, Street, Area"
                  value={form.address_line} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Landmark</label>
                <input name="landmark" className="form-input" placeholder="Near..."
                  value={form.landmark} onChange={handleChange} />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? <Spinner /> : 'Create Account'}
              </button>
            </form>

            <div className="divider" />
            <p className="text-center text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
