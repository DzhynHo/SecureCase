"use client";
import React, { useEffect, useState } from 'react';

export default function ReportReviewControls({ reportId }: { reportId: number }) {
  const [user, setUser] = useState<any | null>(null);
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    try { const raw = sessionStorage.getItem('user'); if (raw) setUser(JSON.parse(raw)); } catch {}
    const reviews = JSON.parse(localStorage.getItem('reportReviews') || '{}');
    setState(reviews[reportId] || null);
  }, [reportId]);

  if (!user || user.role !== 'colonel') return null;

  function saveStatus(status: string, comment?: string) {
    const reviews = JSON.parse(localStorage.getItem('reportReviews') || '{}');
    reviews[reportId] = { status, comment, by: user.username, at: new Date().toISOString() };
    localStorage.setItem('reportReviews', JSON.stringify(reviews));
    setState(reviews[reportId]);
  }

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => saveStatus('approved')}>Approve</button>
        <button className="px-3 py-1 bg-yellow-500 text-black rounded" onClick={() => {
          const comment = prompt('Request correction comment:') || '';
          saveStatus('needs_correction', comment);
        }}>Request correction</button>
      </div>
      {state && (
        <div className="mt-2 text-sm">
          <div>Status: <strong>{state.status}</strong></div>
          {state.comment && <div>Comment: {state.comment}</div>}
          <div>By: {state.by} at {new Date(state.at).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
