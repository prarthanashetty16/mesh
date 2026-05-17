import React from 'react';

export default function StatusBadge({ status }) {
  const s = (status || '').toLowerCase().replace(' ', '_');
  return <span className={`badge badge-${s}`}>{status}</span>;
}
