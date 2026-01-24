"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ReportReviewSummary from './ReportReviewSummary';

export default function CaseReportsClient({ caseId }: { caseId: number }) {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('customReports');
      const arr = raw ? JSON.parse(raw) : [];
      const mine = arr.filter((r: any) => Number(r.caseId) === Number(caseId));
      setReports(mine);
    } catch (err) {
      setReports([]);
    }
  }, [caseId]);

  const [user, setUser] = useState<any | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  if (!user || user.role !== 'police_officer') return null;
  if (reports.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2 text-black">Local reports for this case</h4>
      <ul className="space-y-2">
        {reports.map((r) => (
          <li key={r.id} className="p-3 border rounded">
            <div className="flex items-start justify-between">
              <Link href={`/reports/${r.id}`} className="block">
                <div className="font-medium text-black">Report #{r.id} — {new Date(r.date).toLocaleString()}</div>
                <div className="text-sm text-black">{r.location}</div>
              </Link>
              <div>
                <ReportReviewSummary reportId={r.id} />
              </div>
            </div>
            <div className="text-sm text-black mt-1">{r.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
