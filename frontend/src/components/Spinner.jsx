import React from 'react';

export function Spinner({ size = 'sm' }) {
  return <span className={`spinner${size === 'lg' ? ' spinner-lg' : ''}`} />;
}

export function LoadingPage() {
  return (
    <div className="loading-center">
      <Spinner size="lg" />
    </div>
  );
}
