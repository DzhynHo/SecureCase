"use client";
import React, { useEffect, useState } from 'react';
import reportsData from '@/data/reports.json';

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

    // if approved, update related case status to closed
    try {
      // find report to get caseId (search static + local)
      const staticReports = (reportsData as any).reports || [];
      const localRaw = localStorage.getItem('customReports') || '[]';
      const local = localRaw ? JSON.parse(localRaw) : [];
      const allReports = [...local, ...staticReports];
      const rpt = allReports.find((r: any) => Number(r.id) === Number(reportId));
      if (rpt && status === 'approved') {
        const caseId = rpt.caseId;
        // update customCases
        const rawCases = localStorage.getItem('customCases') || '[]';
        const arr = rawCases ? JSON.parse(rawCases) : [];
        const idx = arr.findIndex((c: any) => Number(c.id) === Number(caseId));
        if (idx >= 0) {
          arr[idx].status = 'zamknieta';
        } else {
          arr.push({ id: caseId, status: 'zamknieta' });
        }
        localStorage.setItem('customCases', JSON.stringify(arr));
        const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
        log.push({ ts: new Date().toISOString(), userId: user.id, username: user.username, action: 'approve_report', details: `Approved report ${reportId} and closed case ${caseId}`, reportId, caseId });
        localStorage.setItem('activityLog', JSON.stringify(log));
        // reload page to reflect status change
        setTimeout(() => window.location.reload(), 300);
      }
      // log request for correction as well
      if (rpt && status === 'needs_correction') {
        try {
          const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
          log.push({ ts: new Date().toISOString(), userId: user.id, username: user.username, action: 'request_correction', details: `Requested correction for report ${reportId}: ${comment || ''}`, reportId });
          localStorage.setItem('activityLog', JSON.stringify(log));
        } catch (err) {}
      }
    } catch (err) {}
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
