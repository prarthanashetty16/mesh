import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import { LoadingPage, Spinner } from '../components/Spinner';

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [task, setTask]               = useState(null);
  const [applications, setApps]       = useState([]);
  const [reviews, setReviews]         = useState([]);
  const [priceSuggestion, setSug]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [applyLoading, setApplyLoad]  = useState(false);
  const [completeLoad, setComplLoad]  = useState(false);
  const [deleteLoad, setDeleteLoad]   = useState(false);
  const [actionMsg, setActionMsg]     = useState({ type: '', text: '' });
  const [showReviewForm, setShowReview] = useState(false);
  const [review, setReview]           = useState({ rating: 5, comment: '' });
  const [reviewLoad, setReviewLoad]   = useState(false);

  const isCreator  = user && task && user.user_id === task.created_by;
  const isAssigned = user && task && user.user_id === task.assigned_to;

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [taskRes, reviewsRes] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get(`/reviews/task/${id}`),
      ]);
      setTask(taskRes.data.data);
      setReviews(reviewsRes.data.data?.reviews || []);

      // Fetch applications if user is the creator
      if (user && taskRes.data.data.created_by === user.user_id) {
        try {
          const appRes = await api.get(`/applications/task/${id}`);
          setApps(appRes.data.data?.applications || []);
        } catch {}
      }

      // Price suggestion
      try {
        const sugRes = await api.get(`/applications/task/${id}/price-suggestion`);
        if (sugRes.data.data?.suggestion_needed) setSug(sugRes.data.data);
      } catch {}
    } catch {
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const msg = (type, text) => { setActionMsg({ type, text }); setTimeout(() => setActionMsg({ type: '', text: '' }), 4000); };

  const handleApply = async () => {
    setApplyLoad(true);
    try {
      await api.post(`/applications/${id}/apply`);
      msg('success', 'Application submitted successfully!');
    } catch (err) {
      msg('error', err.response?.data?.message || 'Failed to apply');
    } finally { setApplyLoad(false); }
  };

  const handleAccept = async (appId) => {
    try {
      await api.post(`/applications/${appId}/accept`);
      msg('success', 'Application accepted! Task assigned.');
      fetchAll();
    } catch (err) { msg('error', err.response?.data?.message || 'Failed to accept'); }
  };

  const handleReject = async (appId) => {
    try {
      await api.post(`/applications/${appId}/reject`);
      msg('success', 'Application rejected.');
      fetchAll();
    } catch (err) { msg('error', err.response?.data?.message || 'Failed to reject'); }
  };

  const handleComplete = async () => {
    if (!window.confirm('Complete this task and release payment?')) return;
    setComplLoad(true);
    try {
      await api.post(`/tasks/${id}/complete`);
      msg('success', 'Task completed and payment released!');
      window.dispatchEvent(new Event('wallet-updated'));
      fetchAll();
    } catch (err) { msg('error', err.response?.data?.message || 'Failed to complete'); }
    finally { setComplLoad(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setDeleteLoad(true);
    try {
      await api.delete(`/tasks/${id}`);
      navigate('/dashboard');
    } catch (err) { msg('error', err.response?.data?.message || 'Failed to delete'); }
    finally { setDeleteLoad(false); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoad(true);
    try {
      await api.post(`/reviews/task/${id}`, review);
      msg('success', 'Review submitted!');
      setShowReview(false);
      fetchAll();
    } catch (err) { msg('error', err.response?.data?.message || 'Failed to submit review'); }
    finally { setReviewLoad(false); }
  };

  if (loading) return <div className="page-wrapper"><LoadingPage /></div>;
  if (!task) return null;

  const deadline = task.deadline ? new Date(task.deadline).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : 'No deadline';

  const canReview = user && task.status === 'COMPLETED' &&
    (user.user_id === task.created_by || user.user_id === task.assigned_to);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
          {/* ── Left: Main content ── */}
          <div>
            {/* Back */}
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>
              ← Back
            </button>

            {/* Alerts */}
            {actionMsg.text && (
              <div className={`alert alert-${actionMsg.type === 'success' ? 'success' : 'error'}`}>
                {actionMsg.text}
              </div>
            )}
            {priceSuggestion && (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                💡 {priceSuggestion.message} Suggested price: <strong>₹{priceSuggestion.suggested_price?.toFixed(0)}</strong>
              </div>
            )}

            {/* Task header */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <StatusBadge status={task.status} />
                <span style={{ fontSize: '2rem', fontWeight: 800 }} className="gradient-text">
                  ₹{parseFloat(task.price || 0).toLocaleString()}
                </span>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{task.title}</h1>
              {task.description && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{task.description}</p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                {task.name && <Meta icon="👤" label="Posted by" value={task.name} />}
                {task.city && <Meta icon="📍" label="Location" value={`${task.city}${task.state ? ', ' + task.state : ''}`} />}
                <Meta icon="🗓" label="Deadline" value={deadline} />
                <Meta icon="📅" label="Posted" value={new Date(task.created_at).toLocaleDateString('en-IN')} />
              </div>
            </div>

            {/* Applications (creator view) */}
            {isCreator && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h2 className="heading-md" style={{ marginBottom: 16 }}>
                  Applications ({applications.length})
                </h2>
                {applications.length === 0 ? (
                  <p className="text-muted text-sm">No applications yet.</p>
                ) : (
                  <div className="flex-col gap-12">
                    {applications.map(app => (
                      <div key={app.application_id} style={{
                        padding: '14px 16px', background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 2 }}>{app.name}</div>
                          <div className="text-xs text-muted">
                            Applied {new Date(app.applied_at).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`badge badge-${(app.status || '').toLowerCase()}`}>{app.status}</span>
                          {app.status === 'PENDING' && task.status === 'OPEN' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleAccept(app.application_id)}>Accept</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleReject(app.application_id)}>Reject</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 className="heading-md">Reviews ({reviews.length})</h2>
                {canReview && !showReviewForm && (
                  <button className="btn btn-primary btn-sm" onClick={() => setShowReview(true)}>Write Review</button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} style={{ marginBottom: 20, padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)' }}>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label">Rating</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1,2,3,4,5].map(n => (
                        <button type="button" key={n} onClick={() => setReview(r => ({ ...r, rating: n }))}
                          style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', opacity: n <= review.rating ? 1 : 0.3, filter: n <= review.rating ? 'none' : 'grayscale(1)' }}>★</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label">Comment</label>
                    <textarea className="form-input form-textarea" rows={3} placeholder="Share your experience..."
                      value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={reviewLoad}>
                      {reviewLoad ? <Spinner /> : 'Submit'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowReview(false)}>Cancel</button>
                  </div>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-muted text-sm">No reviews yet.</p>
              ) : (
                <div className="flex-col gap-12">
                  {reviews.map(r => (
                    <div key={r.review_id} style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.reviewer_name}</span>
                        <StarRating rating={r.rating} />
                      </div>
                      {r.comment && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.comment}</p>}
                      <p className="text-xs text-muted" style={{ marginTop: 4 }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Action sidebar ── */}
          <div style={{ position: 'sticky', top: 88 }}>
            <div className="card">
              <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 4 }} className="gradient-text">
                ₹{parseFloat(task.price || 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted" style={{ marginBottom: 20 }}>Task budget</p>

              {/* Apply button (non-creator, non-assigned, task is open) */}
              {user && !isCreator && task.status === 'OPEN' && (
                <button className="btn btn-primary btn-full btn-lg" style={{ marginBottom: 12 }}
                  onClick={handleApply} disabled={applyLoading}>
                  {applyLoading ? <Spinner /> : '✋ Apply for Task'}
                </button>
              )}

              {/* Complete button (creator, task is assigned) */}
              {isCreator && ['ASSIGNED', 'IN_PROGRESS'].includes(task.status) && (
                <button className="btn btn-success btn-full" style={{ marginBottom: 12 }}
                  onClick={handleComplete} disabled={completeLoad}>
                  {completeLoad ? <Spinner /> : '✅ Mark Complete & Pay'}
                </button>
              )}

              {/* Delete (creator, open/cancelled) */}
              {isCreator && ['OPEN', 'CANCELLED'].includes(task.status) && (
                <button className="btn btn-danger btn-full btn-sm"
                  onClick={handleDelete} disabled={deleteLoad} style={{ marginBottom: 12 }}>
                  {deleteLoad ? <Spinner /> : '🗑 Delete Task'}
                </button>
              )}

              {!user && (
                <div>
                  <button className="btn btn-primary btn-full btn-lg" style={{ marginBottom: 12 }}
                    onClick={() => navigate('/login')}>Sign in to Apply</button>
                </div>
              )}

              {task.assigned_to && (
                <div style={{ marginTop: 16, padding: 14, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <p className="text-xs text-muted" style={{ marginBottom: 4 }}>Assigned Worker</p>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{task.performer_name || `User #${task.assigned_to}`}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Meta({ icon, label, value }) {
  return (
    <div>
      <p className="text-xs text-muted" style={{ marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>{icon}</span> {value}
      </p>
    </div>
  );
}
