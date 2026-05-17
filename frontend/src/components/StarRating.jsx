import React from 'react';

export default function StarRating({ rating, size = '14px' }) {
  const r = Math.round(parseFloat(rating) || 0);
  return (
    <span className="stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= r ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </span>
  );
}
