"use client";
import React, { useEffect, useState } from 'react';

export default function ReportReviewSummary({ reportId }: { reportId: number }) {
  const [state, setState] = useState<any>(null);
  useEffect(() => {
    const reviews = JSON.parse(localStorage.getItem('reportReviews') || '{}');
    setState(reviews[reportId] || null);
  }, [reportId]);
  if (!state) return <div className="text-xs text-gray-600">No review</div>;
  return <div className="text-xs">{state.status}{state.comment ? `: ${state.comment}` : ''}</div>;
}
