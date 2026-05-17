import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const FEATURES = [
  { icon: '📋', title: 'Post Any Task', desc: 'Need help with something? Post it in seconds and get applicants fast.' },
  { icon: '🔍', title: 'Browse & Apply', desc: 'Find tasks nearby or filter by price and location to earn on your schedule.' },
  { icon: '💳', title: 'Secure Wallet', desc: 'Payments handled safely through your in-app wallet. No cash hassles.' },
  { icon: '⭐', title: 'Reviews & Ratings', desc: 'Build trust through a transparent review system after every completed task.' },
  { icon: '📍', title: 'Location Aware', desc: 'Discover tasks within your neighbourhood using smart geo-search.' },
  { icon: '⚡', title: 'Real-time Updates', desc: 'Accept, assign, and complete tasks with live status tracking.' },
];

const STATS = [
  { value: '10K+', label: 'Active Users' },
  { value: '25K+', label: 'Tasks Completed' },
  { value: '₹5L+', label: 'Paid Out' },
  { value: '4.8★', label: 'Avg Rating' },
];

export default function Landing() {
  const { user } = useAuthStore();

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden', paddingTop: 80,
      }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="glow-orb" style={{ width: 600, height: 600, background: 'rgba(108,99,255,0.08)', top: -200, right: -200, animation: 'pulse 4s ease-in-out infinite' }} />
          <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(34,211,160,0.06)', bottom: -100, left: -100, animation: 'pulse 5s ease-in-out infinite 1s' }} />
          {/* Grid lines */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: 'linear-gradient(var(--text-primary) 1px,transparent 1px),linear-gradient(90deg,var(--text-primary) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '80px 24px' }}>
          <div className="animate-slide-up">
            {/* Pill badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32,
              background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: 'var(--radius-full)', padding: '6px 16px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span className="text-sm" style={{ color: 'var(--accent-light)', fontWeight: 500 }}>The task marketplace is live</span>
            </div>

            <h1 className="display mb-24" style={{ maxWidth: 760, margin: '0 auto 24px' }}>
              Get things done.<br />
              <span className="gradient-text">Earn doing what you love.</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>
              Mesh connects people who need tasks done with skilled individuals ready to help —
              locally, safely, and fairly.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {user ? (
                <>
                  <Link to="/browse" className="btn btn-primary btn-lg">Browse Tasks →</Link>
                  <Link to="/create-task" className="btn btn-ghost btn-lg">Post a Task</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">Get Started Free →</Link>
                  <Link to="/browse" className="btn btn-ghost btn-lg">Browse Tasks</Link>
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 0,
            marginTop: 80, borderTop: '1px solid var(--border)', paddingTop: 48, flexWrap: 'wrap',
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                padding: '0 40px',
                borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Syne' }} className="gradient-text">{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '100px 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="text-center mb-40" style={{ marginBottom: 56 }}>
            <h2 className="heading-xl mb-12" style={{ marginBottom: 12 }}>Everything you need, nothing you don't</h2>
            <p className="text-muted" style={{ maxWidth: 500, margin: '0 auto' }}>
              A complete task marketplace built for the modern gig economy.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card" style={{ cursor: 'default' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div className="text-center mb-40" style={{ marginBottom: 56 }}>
            <h2 className="heading-xl mb-12" style={{ marginBottom: 12 }}>How Mesh works</h2>
            <p className="text-muted">Simple three-step process to get started</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, position: 'relative' }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute', top: 32, left: '16.67%', right: '16.67%', height: 2,
              background: 'linear-gradient(90deg, var(--accent), var(--green))', opacity: 0.3, zIndex: 0,
            }} />

            {[
              { step: '01', icon: '✍️', title: 'Post or Find', desc: 'Create a task with a budget and deadline, or browse open tasks in your area.' },
              { step: '02', icon: '🤝', title: 'Match & Accept', desc: 'Task creators review applicants and accept the best fit. Price suggestions help if stuck.' },
              { step: '03', icon: '💰', title: 'Complete & Pay', desc: 'Worker completes the task, creator confirms, and payment is released from wallet instantly.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 24px',
                  background: 'linear-gradient(135deg, var(--accent), var(--green))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', boxShadow: '0 8px 32px var(--accent-glow)',
                }}>{s.icon}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-light)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>STEP {s.step}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 240, margin: '0 auto' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-surface)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(34,211,160,0.1))',
            border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-xl)',
            padding: '60px 40px',
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16, fontFamily: 'Syne' }}>
              Ready to join the mesh?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              Sign up free today and start posting or completing tasks in your neighbourhood.
            </p>
            {user ? (
              <Link to="/browse" className="btn btn-primary btn-lg">Browse Tasks →</Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">Join Mesh Free →</Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #6c63ff, #22d3a0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '0.8rem', color: '#fff',
            }}>M</div>
            <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>Mesh</span>
          </div>
          <p className="text-xs text-muted">© 2026 Mesh. A task sharing platform.</p>
        </div>
      </footer>
    </div>
  );
}
