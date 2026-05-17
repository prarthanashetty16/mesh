import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import StarRating from './StarRating';

export default function TaskCard({ task, showApplicants = false }) {
  const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : null;

  return (
    <Link to={`/tasks/${task.task_id}`} style={{ display: 'block' }}>
      <div className="card" style={{ height: '100%', cursor: 'pointer', transition: 'all 0.2s ease' }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(108,99,255,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <StatusBadge status={task.status} />
          <span style={{
            fontSize: '1.2rem', fontWeight: 800,
            background: 'linear-gradient(135deg,#6c63ff,#22d3a0)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>₹{parseFloat(task.price || 0).toLocaleString()}</span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}
          className="truncate">{task.title}</h3>

        {/* Description */}
        {task.description && (
          <p style={{
            fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{task.description}</p>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 'auto' }}>
          {task.name && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              👤 {task.name}
            </span>
          )}
          {task.city && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              📍 {task.city}
            </span>
          )}
          {deadline && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              🗓 {deadline}
            </span>
          )}
        </div>

        {task.creator_rating && (
          <div style={{ marginTop: 10 }}>
            <StarRating rating={task.creator_rating} size="12px" />
          </div>
        )}
      </div>
    </Link>
  );
}
