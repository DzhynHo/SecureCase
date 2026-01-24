"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ReportReviewControls from './ReportReviewControls';

export default function ReportClientView({ reportId }: { reportId: number }) {
  const [report, setReport] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [sessionUser, setSessionUser] = useState<any | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('customReports');
      const arr = raw ? JSON.parse(raw) : [];
      const r = arr.find((x: any) => Number(x.id) === Number(reportId));
      if (r) setReport(r);
    } catch (err) {
      // ignore
    }

    try {
      const uRaw = localStorage.getItem('users');
      if (uRaw) setUsers(JSON.parse(uRaw));
    } catch {}
    try {
      const s = sessionStorage.getItem('user');
      if (s) setSessionUser(JSON.parse(s));
    } catch {}
  }, [reportId]);

  function norm(p: string | undefined) {
    if (!p) return "";
    if (p.startsWith('/images')) return p;
    if (p.startsWith('/mugshots') || p.startsWith('/fingerprints') || p.startsWith('/places')) return `/images${p}`;
    return p;
  }

  if (!report) return <div className="p-8">Report not found (client)</div>;

  // Allow colonel to view local reports; police officer author can view and edit their own.
  if (!sessionUser) return <div className="p-8">Report not available.</div>;
  const isAuthor = sessionUser.role === 'police_officer' && sessionUser.id === report.authorId;
  const isColonel = sessionUser.role === 'colonel';
  if (!isAuthor && !isColonel) {
    return <div className="p-8">Report not available.</div>;
  }

  const author = (users || []).find((u: any) => u.id === report.authorId) || null;
  // ensure only police authors are shown
  const showAuthor = author && author.role === 'police_officer';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <Link href="/dashboard" className="text-sm text-blue-600">← Back</Link>
        <h1 className="text-2xl font-bold mt-4">Report #{report.id}</h1>
        <p className="text-sm text-black mt-2">Case: {report.caseId} — Date: {new Date(report.date).toLocaleString()}</p>
        <p className="mt-3 text-black">Location: {report.location}</p>
        <p className="mt-3 text-black">Author: {showAuthor ? `${author.firstName} ${author.lastName}` : '(removed - must be police)'}</p>

        <div className="mt-4 text-black">{report.content}</div>

        <div className="mt-4">
          <h3 className="font-semibold text-black">Photos</h3>
          <div className="flex gap-2 flex-wrap mt-2">
            {(report.photos || []).map((p: string, i: number) => (
              <img key={i} src={norm(p)} alt={`photo-${i}`} className="w-48 h-32 object-cover rounded border" style={{ height: 'auto' }} />
            ))}
          </div>
        </div>

        <div>
          <ReportReviewControls reportId={report.id} />
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-black">Fingerprints</h3>
          <div className="flex gap-2 flex-wrap mt-2">
            {(report.fingerprints || []).map((p: string, i: number) => (
              <img key={i} src={norm(p)} alt={`fp-${i}`} className="w-32 h-32 object-cover rounded border" style={{ height: 'auto' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
