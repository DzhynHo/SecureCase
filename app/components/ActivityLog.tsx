"use client";
import React, { useEffect, useState } from 'react';

export default function ActivityLog({ caseId }: { caseId?: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    try {
      const rawUser = sessionStorage.getItem('user');
      if (rawUser) setUser(JSON.parse(rawUser));
    } catch {}
    try {
      const all = JSON.parse(localStorage.getItem('activityLog') || '[]');
      const filtered = caseId ? all.filter((i: any) => i.caseId === caseId) : all;
      // show newest first
      setItems(filtered.sort((a: any, b: any) => b.ts.localeCompare(a.ts)));
    } catch {
      setItems([]);
    }
  }, [caseId]);

  if (!user || user.role !== 'colonel') return null;
  if (!items || items.length === 0) return <div className="text-sm text-gray-600">No activity.</div>;

  return (
    <div className="space-y-2">
      {items.map((it: any, idx: number) => (
        <div key={idx} className="p-2 border rounded bg-white">
          <div className="text-xs text-gray-500">{new Date(it.ts).toLocaleString()} — {it.username || it.userId}</div>
          <div className="text-sm font-medium">{it.action}</div>
          <div className="text-sm">{it.details}</div>
        </div>
      ))}
    </div>
  );
}
