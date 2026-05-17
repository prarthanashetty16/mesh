import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [walletBalance, setWalletBalance] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      fetchWalletBalance();
    }

    const handleWalletUpdate = () => fetchWalletBalance();
    window.addEventListener('wallet-updated', handleWalletUpdate);
    
    return () => {
      window.removeEventListener('wallet-updated', handleWalletUpdate);
    };
  }, [user]);

  const fetchWalletBalance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wallet/balance');
      setWalletBalance(res.data.data.wallet_balance);
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: 'rgba(10,11,15,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #6c63ff, #22d3a0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '0.9rem', color: '#fff',
          }}>M</div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>Mesh</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
          {user ? (
            <>
              <NavLink to="/browse" active={isActive('/browse')}>Browse</NavLink>
              <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
              <NavLink to="/create-task" active={isActive('/create-task')}>Post Task</NavLink>
              <NavLink to="/wallet" active={isActive('/wallet')}>
                Wallet {walletBalance !== null && (
                  <span style={{ marginLeft: 6, fontSize: '0.85rem', opacity: 0.8 }}>
                    (₹{parseFloat(walletBalance || 0).toLocaleString()})
                  </span>
                )}
              </NavLink>
              <NavLink to="/profile" active={isActive('/profile')}>Profile</NavLink>
              <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>
              <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/browse" active={isActive('/browse')}>Browse Tasks</NavLink>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none' }}>
          <span style={{ fontSize: '1.2rem' }}>{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
          padding: '12px 24px 20px',
        }}>
          {user ? (
            <div className="flex-col gap-8">
              <MobileLink to="/browse" onClick={() => setMenuOpen(false)}>Browse Tasks</MobileLink>
              <MobileLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/create-task" onClick={() => setMenuOpen(false)}>Post Task</MobileLink>
              <MobileLink to="/wallet" onClick={() => setMenuOpen(false)}>
                Wallet {walletBalance !== null && (
                  <span style={{ marginLeft: 4, fontSize: '0.85rem', opacity: 0.8 }}>
                    (₹{parseFloat(walletBalance || 0).toLocaleString()})
                  </span>
                )}
              </MobileLink>
              <MobileLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</MobileLink>
              <MobileLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</MobileLink>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>Sign Out</button>
            </div>
          ) : (
            <div className="flex-col gap-8">
              <MobileLink to="/browse" onClick={() => setMenuOpen(false)}>Browse Tasks</MobileLink>
              <MobileLink to="/login" onClick={() => setMenuOpen(false)}>Sign In</MobileLink>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}
                onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} style={{
      padding: '6px 12px', borderRadius: 'var(--radius-sm)',
      fontSize: '0.875rem', fontWeight: 500,
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      background: active ? 'var(--bg-elevated)' : 'transparent',
      transition: 'var(--transition)',
    }}
      onMouseEnter={e => { if (!active) e.target.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { if (!active) e.target.style.color = 'var(--text-secondary)'; }}
    >
      {children}
    </Link>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick} style={{
      padding: '10px 0', fontSize: '0.95rem', fontWeight: 500,
      color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)',
      display: 'block',
    }}>{children}</Link>
  );
}
