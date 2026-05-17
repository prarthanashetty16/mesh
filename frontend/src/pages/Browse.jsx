import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import { LoadingPage } from '../components/Spinner';

export default function Browse() {
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [minPrice, setMinPrice]     = useState('');
  const [maxPrice, setMaxPrice]     = useState('');
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({});
  const [filtering, setFiltering]   = useState(false);

  const fetchTasks = async (p = 1) => {
    setLoading(true);
    try {
      const hasFilter = minPrice || maxPrice;
      let res;
      if (hasFilter) {
        const params = new URLSearchParams({ page: p, limit: 12 });
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        res = await api.get(`/tasks/filter?${params}`);
      } else {
        res = await api.get(`/tasks?page=${p}&limit=12`);
      }
      const d = res.data.data;
      setTasks(d.tasks || []);
      setPagination(d.pagination || {});
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(page); }, [page]);

  const handleFilter = (e) => { e.preventDefault(); setPage(1); fetchTasks(1); };
  const clearFilters = () => { setMinPrice(''); setMaxPrice(''); setPage(1); fetchTasks(1); };

  const filtered = search
    ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase()))
    : tasks;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 8 }}>Browse Tasks</h1>
          <p className="text-muted">Find tasks near you and start earning</p>
        </div>

        {/* Search + Filters */}
        <div className="card" style={{ marginBottom: 28, padding: '20px 24px' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Search */}
            <div style={{ flex: 2, minWidth: 200 }}>
              <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Search</label>
              <div className="search-bar">
                <span style={{ color: 'var(--text-muted)' }}>🔍</span>
                <input placeholder="Search by title or description…"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            {/* Price range */}
            <div style={{ flex: 1, minWidth: 120 }}>
              <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Min Price (₹)</label>
              <input type="number" className="form-input" placeholder="0"
                value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Max Price (₹)</label>
              <input type="number" className="form-input" placeholder="Any"
                value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleFilter}>Filter</button>
              {(minPrice || maxPrice) && (
                <button className="btn btn-ghost" onClick={clearFilters}>Clear</button>
              )}
            </div>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
            Showing {filtered.length} task{filtered.length !== 1 ? 's' : ''}
            {pagination.total ? ` of ${pagination.total} total` : ''}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <LoadingPage />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No tasks found</h3>
            <p>Try adjusting your filters or check back later for new tasks.</p>
            <Link to="/create-task" className="btn btn-primary">Post a Task</Link>
          </div>
        ) : (
          <div className="grid-3" style={{ marginBottom: 40 }}>
            {filtered.map(t => <TaskCard key={t.task_id} task={t} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Page {page} of {pagination.pages}
            </span>
            <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
