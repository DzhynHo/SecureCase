"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ReportReviewSummary from './ReportReviewSummary';

export default function ReportsListClient({ reports }: { reports: any[] }) {
  const [user, setUser] = useState<any | null>(null);
  const [deleted, setDeleted] = useState<number[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    try {
      const d = JSON.parse(localStorage.getItem('deletedReports') || '[]');
      setDeleted(d);
    } catch { setDeleted([]); }
  }, []);

  useEffect(() => {
    try {
      const localRaw = localStorage.getItem('customReports');
      const local = localRaw ? JSON.parse(localRaw) : [];
      // mark local reports
      const localMarked = (local || []).map((r: any) => ({ ...r, _isLocal: true }));
      const merged = [ ...(reports || []), ...localMarked ];
      const visible = merged.filter((r: any) => !deleted.includes(r.id));
      // sort by date desc
      visible.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''));
      setItems(visible);
    } catch (err) {
      setItems(reports.filter(r => !deleted.includes(r.id)));
    }
  }, [reports, deleted]);

  function deleteReport(id: number) {
    if (!confirm('Delete report #' + id + '?')) return;
    try {
      const d = JSON.parse(localStorage.getItem('deletedReports') || '[]');
      d.push(id);
      localStorage.setItem('deletedReports', JSON.stringify(d));
      setDeleted(d);
      // log activity
      const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
      log.push({ ts: new Date().toISOString(), username: user?.username, action: 'delete_report', details: `Deleted report ${id}` , reportId: id });
      localStorage.setItem('activityLog', JSON.stringify(log));
    } catch {}
  }

  if (!items || items.length === 0) return <p className="text-sm text-black">No reports available.</p>;

  return (
    <ul className="space-y-2">
      {items.map((r: any) => (
        <li key={r.id} className="p-3 border rounded bg-white">
          <div className="flex items-start justify-between">
            <Link href={`/reports/${r.id}`} className="block">
              <div className="font-medium text-black">Report #{r.id} — Case {r.caseId} {r._isLocal ? '(local)' : ''}</div>
              <div className="text-sm text-black">{new Date(r.date).toLocaleString()} — {r.location}</div>
            </Link>
            <div className="flex items-center gap-2">
              <ReportReviewSummary reportId={r.id} />
              {user && user.role === 'colonel' && (
                <button onClick={() => deleteReport(r.id)} className="px-2 py-1 bg-red-600 text-white text-xs rounded">Delete</button>
              )}
            </div>
          </div>
          <div className="text-sm text-black mt-1">{r.content}</div>
        </li>
      ))}
    </ul>
  );
}
