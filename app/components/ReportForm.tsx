"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReportForm({ caseId }: { caseId: number }) {
  const [user, setUser] = useState<any | null>(null);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState("");
  const [fingerprints, setFingerprints] = useState("");
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  if (!user || user.role !== 'police_officer') return null;

  function saveToLocal(report: any) {
    const existing = JSON.parse(localStorage.getItem('customReports' ) || '[]');
    existing.push(report);
    localStorage.setItem('customReports', JSON.stringify(existing));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = Date.now();
    const r = { id, caseId, authorId: user.id, date: new Date().toISOString(), location, content, photos: photos ? photos.split(',').map(s=>s.trim()) : [], fingerprints: fingerprints ? fingerprints.split(',').map(s=>s.trim()) : [], status: 'pending' };
    saveToLocal(r);
    // activity log: report created
    try {
      const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
      log.push({ ts: new Date().toISOString(), userId: user.id, username: user.username, action: 'create_report', details: `Created report ${id} for case ${caseId}`, caseId, reportId: id });
      localStorage.setItem('activityLog', JSON.stringify(log));
    } catch {}
    // ensure author info available for client-side viewers
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const exists = users.find((u: any) => u.id === user.id);
      if (!exists) {
        users.push({ id: user.id, firstName: user.firstName, lastName: user.lastName, username: user.username, role: user.role });
        localStorage.setItem('users', JSON.stringify(users));
      }
    } catch {}
    router.push(`/reports/${id}`);
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-2 p-3 border rounded bg-gray-50">
      <h4 className="font-medium">Create report for this case</h4>
      <div>
        <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Location" className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Content" className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <input value={photos} onChange={(e)=>setPhotos(e.target.value)} placeholder="Photos (comma-separated URLs)" className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <input value={fingerprints} onChange={(e)=>setFingerprints(e.target.value)} placeholder="Fingerprints (comma-separated URLs)" className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <button className="px-3 py-1 bg-blue-600 text-white rounded" type="submit">Create report</button>
      </div>
    </form>
  );
}
