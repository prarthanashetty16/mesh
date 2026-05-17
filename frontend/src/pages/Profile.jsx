import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import StarRating from '../components/StarRating';
import MapPicker from '../components/MapPicker';
import { LoadingPage, Spinner } from '../components/Spinner';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [saveLoad, setSaveLoad] = useState(false);
  const [msg, setMsg]           = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();

    const handleWalletUpdate = () => fetchProfile();
    window.addEventListener('wallet-updated', handleWalletUpdate);
    
    return () => {
      window.removeEventListener('wallet-updated', handleWalletUpdate);
    };
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/user/reviews'),
      ]);
      setProfile(pRes.data.data);
      setReviews(rRes.data.data?.reviews || []);
      setForm({
        name: pRes.data.data.name || '',
        address_line: pRes.data.data.address_line || '',
        landmark: pRes.data.data.landmark || '',
        latitude: pRes.data.data.location?.latitude || '',
        longitude: pRes.data.data.location?.longitude || '',
      });
    } catch {}
    finally { setLoading(false); }
  };

  const handleLocationSelect = (location) => {
    setForm(f => ({ ...f, latitude: location.latitude, longitude: location.longitude }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoad(true);
    try {
      await api.put('/user/profile', form);
      setUser({ ...user, name: form.name });
      setMsg({ type: 'success', text: 'Profile updated!' });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update' });
    } finally {
      setSaveLoad(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  if (loading) return <div className="page-wrapper"><LoadingPage /></div>;
  if (!profile) return null;

  const initials = profile.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ME';

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>

          {/* Left: Avatar + info */}
          <div>
            <div className="card" style={{ textAlign: 'center', padding: 28 }}>
              {/* Avatar */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
                background: 'linear-gradient(135deg, var(--accent), var(--green))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', fontWeight: 700, color: '#fff',
              }}>{initials}</div>

              <h2 style={{ fontWeight: 700, marginBottom: 4 }}>{profile.name}</h2>
              <p className="text-sm text-muted" style={{ marginBottom: 12 }}>{profile.email}</p>

              {profile.rating && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center', marginBottom: 12 }}>
                  <StarRating rating={profile.rating} size="16px" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{parseFloat(profile.rating).toFixed(1)}</span>
                </div>
              )}

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {profile.phone && (
                  <InfoRow icon="📞" value={profile.phone} />
                )}
                {profile.area?.city && (
                  <InfoRow icon="📍" value={`${profile.area.city}, ${profile.area.state || ''}`} />
                )}
                {profile.address_line && (
                  <InfoRow icon="🏠" value={profile.address_line} />
                )}
              </div>

              <div style={{ marginTop: 16, padding: 14, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <p className="text-xs text-muted" style={{ marginBottom: 4 }}>Wallet Balance</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 800 }} className="gradient-text">
                  ₹{parseFloat(profile.wallet_balance || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Edit form + reviews */}
          <div className="flex-col gap-20">
            {/* Edit card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className="heading-md">Personal Details</h2>
                {!editing && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSave} className="flex-col gap-16">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input className="form-input" value={form.address_line}
                      onChange={e => setForm(f => ({ ...f, address_line: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Landmark</label>
                    <input className="form-input" value={form.landmark}
                      onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))} />
                  </div>
                  <MapPicker 
                    key={`map-${form.latitude}-${form.longitude}`}
                    onLocationSelect={handleLocationSelect}
                    initialLat={form.latitude ? parseFloat(form.latitude) : null}
                    initialLng={form.longitude ? parseFloat(form.longitude) : null}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary" disabled={saveLoad}>
                      {saveLoad ? <Spinner /> : 'Save Changes'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex-col gap-16">
                  <Detail label="Full Name" value={profile.name} />
                  <Detail label="Email" value={profile.email} />
                  <Detail label="Phone" value={profile.phone || '—'} />
                  <Detail label="Address" value={profile.address_line || '—'} />
                  <Detail label="Landmark" value={profile.landmark || '—'} />
                  <Detail label="City" value={profile.area?.city || '—'} />
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="card">
              <h2 className="heading-md" style={{ marginBottom: 16 }}>Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted">No reviews yet.</p>
              ) : (
                <div className="flex-col gap-16">
                  {reviews.map(r => (
                    <div key={r.review_id} style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.reviewer_name || r.name}</span>
                        <StarRating rating={r.rating} />
                      </div>
                      {r.comment && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{r.comment}</p>}
                      <p className="text-xs text-muted" style={{ marginTop: 4 }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:700px){ .container > div { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted" style={{ marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 500 }}>{value}</p>
    </div>
  );
}

function InfoRow({ icon, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
      <span>{icon}</span><span>{value}</span>
    </div>
  );
}
