import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Spinner } from '../components/Spinner';
import MapPicker from '../components/MapPicker';

export default function CreateTask() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', price: '', deadline: '',
    area_id: '', latitude: '', longitude: '',
  });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleLocationSelect = (location) => {
    setForm(p => ({ ...p, latitude: location.latitude, longitude: location.longitude }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.price || parseFloat(form.price) <= 0) { setError('Please enter a valid price.'); return; }
    if (!form.latitude || !form.longitude) { setError('Please select a location on the map.'); return; }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };
      if (form.deadline) payload.deadline = form.deadline;
      if (form.area_id) payload.area_id = parseInt(form.area_id);

      const { data } = await api.post('/tasks', payload);
      setSuccess('Task posted successfully!');
      setTimeout(() => navigate(`/tasks/${data.data.task_id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="animate-slide-up">
          <div className="page-header">
            <h1>Post a New Task</h1>
            <p>Describe what you need done and set a fair budget</p>
          </div>

          <div className="card" style={{ padding: 32 }}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="flex-col gap-20">
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input name="title" className="form-input" placeholder="e.g. Help me move furniture"
                  value={form.title} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input form-textarea" rows={4}
                  placeholder="Describe what needs to be done, any requirements, tools needed, etc."
                  value={form.description} onChange={handleChange} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Budget (₹) *</label>
                  <input name="price" type="number" min="1" step="0.01" className="form-input"
                    placeholder="e.g. 500"
                    value={form.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input name="deadline" type="datetime-local" className="form-input"
                    value={form.deadline} onChange={handleChange} />
                </div>
              </div>

              <MapPicker onLocationSelect={handleLocationSelect} />

              <div style={{ padding: '16px', background: 'rgba(108,99,255,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(108,99,255,0.15)' }}>
                <p className="text-sm" style={{ color: 'var(--accent-light)' }}>
                  💡 <strong>Tip:</strong> Set a realistic budget to attract more applicants. The payment is deducted from your wallet when you mark the task complete.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? <Spinner /> : '🚀 Post Task'}
                </button>
                <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(-1)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
