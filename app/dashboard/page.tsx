"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReportReviewSummary from '@/app/components/ReportReviewSummary';
import ActivityLog from '@/app/components/ActivityLog';
import ReportsListClient from '@/app/components/ReportsListClient';
import casesData from "@/data/cases.json";
import reportsData from "@/data/reports.json";
import usersData from '@/data/users.json';

export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [createdCases, setCreatedCases] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("user");
      if (!raw) {
        router.push('/login');
        return;
      }
      const u = JSON.parse(raw);
      setUser(u);

      // load cases assigned to this user (police_officer)
      const allCases = (casesData as any).cases || [];
      if (u.role === 'police_officer') {
        const mine = allCases.filter((c: any) => c.assignedUserId === u.id);
        setCases(mine);
      } else {
        setCases([]);
      }
    } catch (err) {
      setMsg('Failed to load session');
    }
  }, [router]);

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-black">Welcome, {user.firstName || user.username}</h2>
            <p className="text-sm text-black">Role: {user.role}</p>
          </div>
          <div>
            <button className="px-3 py-1 border rounded mr-2 text-black" onClick={() => { sessionStorage.removeItem('user'); router.push('/'); }}>Sign out</button>
          </div>
        </div>

        {user.role === 'police_officer' && (
          <section>
            <h3 className="font-semibold mb-2 text-black">My cases</h3>
            
            {cases.length === 0 ? (
              <p className="text-sm text-black">You have no assigned cases.</p>
            ) : (
              <FilteredCaseList cases={cases} />
            )}
          </section>
        )}

        {user.role === 'police_officer' && (
          <section className="mt-6">
            <h3 className="font-semibold mb-2 text-black">My reports</h3>
            <ReportsForOfficer casesList={cases} />
          </section>
        )}

        {user.role === 'colonel' && (
          <section>
            <h3 className="font-semibold mb-2 text-black">Colonel controls</h3>
            <p className="text-sm text-black mb-4">As a colonel you can manage reports and create new cases.</p>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-black mb-2">Create New Case</h4>
                <CreateCaseForm onCreate={(c) => setCreatedCases((s) => [c, ...s])} />
              </div>

              <div>
                <h4 className="font-medium text-black mb-2">Reports</h4>
                <ReportsListClient reports={(reportsData as any).reports || []} />
              </div>
              <div>
                <h4 className="font-medium text-black mb-2">Officers</h4>
                <OfficersList />
              </div>
              <div>
                <h4 className="font-medium text-black mb-2">Activity log</h4>
                <ActivityLog />
              </div>
            </div>
          </section>
        )}

        {msg && <div className="mt-4 p-3 bg-yellow-50 rounded text-sm text-black">{msg}</div>}
        {createdCases.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-black mb-2">Recently created (local)</h4>
            <ul className="space-y-2">
              {createdCases.map((c, idx) => (
                <li key={idx} className="p-3 border rounded">
                  <div className="font-medium text-black">{c.number} — {c.title}</div>
                  <div className="text-sm text-black">{c.description}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function OfficersList() {
  const users = (usersData as any).users || [];
  const officers = users.filter((u: any) => u.role === 'police_officer');
  if (officers.length === 0) return <p className="text-sm text-black">No officers found.</p>;
  return (
    <ul className="space-y-2">
      {officers.map((o: any) => (
        <li key={o.id} className="p-2 border rounded">
          <div className="font-medium text-black">{o.firstName} {o.lastName} ({o.username})</div>
          <div className="text-sm text-black">Assigned cases: {o.assignedCaseIds ? o.assignedCaseIds.length : 0}</div>
        </li>
      ))}
    </ul>
  );
}

function ReportsList() {
  const allReports = (reportsData as any).reports || [];
  if (allReports.length === 0) return <p className="text-sm text-black">No reports available.</p>;
  return (
    <ul className="space-y-2">
      {allReports.map((r: any) => (
        <li key={r.id} className="p-3 border rounded">
          <div className="flex items-start justify-between">
            <Link href={`/reports/${r.id}`} className="block">
              <div className="font-medium text-black">Report #{r.id} — Case {r.caseId}</div>
              <div className="text-sm text-black">{new Date(r.date).toLocaleString()} — {r.location}</div>
            </Link>
            <div>
              {/* show review state if any */}
              <ReportReviewSummary reportId={r.id} />
            </div>
          </div>
          <div className="text-sm text-black mt-1">{r.content}</div>
        </li>
      ))}
    </ul>
  );
}

function ReportsForOfficer({ casesList }: { casesList: any[] }) {
  const allReports = (reportsData as any).reports || [];
  const myReports = allReports.filter((r: any) => casesList.some(c => c.id === r.caseId));
  if (myReports.length === 0) return <p className="text-sm text-black">No reports for your cases.</p>;
  return (
    <ul className="space-y-2">
      {myReports.map((r: any) => (
        <li key={r.id} className="p-3 border rounded">
          <div className="flex items-start justify-between">
            <Link href={`/reports/${r.id}`} className="block">
              <div className="font-medium text-black">Report #{r.id} — Case {r.caseId}</div>
              <div className="text-sm text-black">{new Date(r.date).toLocaleString()} — {r.location}</div>
            </Link>
            <div>
              <ReportReviewSummary reportId={r.id} />
            </div>
          </div>
          <div className="text-sm text-black mt-1">{r.content}</div>
        </li>
      ))}
    </ul>
  );
}

function FilteredCaseList({ cases }: { cases: any[] }) {
  const [filter, setFilter] = useState<'to_review'|'in_progress'|'closed'|'all'>('all');

  function matches(c: any) {
    if (filter === 'all') return true;
    if (filter === 'in_progress') return c.status === 'w_toku';
    if (filter === 'closed') return c.status === 'zamknieta';
    if (filter === 'to_review') return c.status === 'w_sadzie' || c.status === 'nowe';
    return true;
  }

  const list = cases.filter(matches);

  return (
    <div>
      <div className="flex gap-2 mb-3">
<button
  onClick={() => setFilter('all')}
  className={`px-2 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
>
  Wszystkie
</button>

<button
  onClick={() => setFilter('to_review')}
  className={`px-2 py-1 rounded ${filter === 'to_review' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
>
  Do rozpatrzenia
</button>

<button
  onClick={() => setFilter('in_progress')}
  className={`px-2 py-1 rounded ${filter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
>
  W trakcie
</button>

<button
  onClick={() => setFilter('closed')}
  className={`px-2 py-1 rounded ${filter === 'closed' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
>
  Zamknięte
</button>

      </div>
      {list.length === 0 ? (
        <p className="text-sm text-black">No cases.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((c) => (
            <li key={c.id} className="p-3 border rounded">
              <Link href={`/cases/${c.id}`} className="block">
                <div className="font-medium text-black">{c.number} — {c.title}</div>
                <div className="text-sm text-black">Status: {c.status}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}



function CreateCaseForm({ onCreate }: { onCreate: (c: any) => void }) {
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!number || !title) return;
    const newCase = { id: Date.now(), number, title, description, status: 'new' };
    onCreate(newCase);
    try {
      const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
      log.push({ ts: new Date().toISOString(), action: 'create_case', details: `Created case ${number} - ${title}`, caseId: newCase.id });
      localStorage.setItem('activityLog', JSON.stringify(log));
    } catch {}
    setNumber(''); setTitle(''); setDescription('');
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div>
        <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Case number" className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <button className="px-3 py-1 bg-green-600 text-white rounded" type="submit">Create (local)</button>
      </div>
    </form>
  );
}
