import React from "react";
import casesData from "@/data/cases.json";
import criminalsData from "@/data/criminals.json";
import usersData from "@/data/users.json";
import reportsData from "@/data/reports.json";
import Link from "next/link";
import ReportForm from '../../components/ReportForm';
import ReportReviewSummary from '@/app/components/ReportReviewSummary';
import CaseReportsClient from '@/app/components/CaseReportsClient';
import CasePhotosManager from '@/app/components/CasePhotosManager';
import ActivityLog from '@/app/components/ActivityLog';

type Props = { params: any };

export default async function CasePage({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  const allCases = (casesData as any).cases || [];
  const c = allCases.find((x: any) => x.id === id);
  if (!c) return <div className="p-8">Case not found</div>;

  const criminals = (criminalsData as any).criminals || [];
  const users = (usersData as any).users || [];
  const reports = (reportsData as any).reports || [];

  const assignedUser = users.find((u: any) => u.id === c.assignedUserId);
  const caseReports = reports.filter((r: any) => r.caseId === c.id);

  function norm(p: string | undefined) {
    if (!p) return "";
    if (p.startsWith("/images")) return p;
    if (p.startsWith("/mugshots") || p.startsWith("/fingerprints") || p.startsWith("/places")) return `/images${p}`;
    return p;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <Link href="/dashboard" className="text-sm text-blue-600">← Back</Link>
        <h1 className="text-2xl font-bold mt-4">{c.number} — {c.title}</h1>
        <p className="text-sm text-black mt-2">Status: {c.status}</p>
        <p className="mt-3 text-black">{c.description}</p>

        <div className="mt-4">
          <h3 className="font-semibold text-black">Assigned officer</h3>
          {assignedUser ? (
            <div className="text-black">{assignedUser.firstName} {assignedUser.lastName} ({assignedUser.username})</div>
          ) : (
            <div className="text-black">Not assigned</div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-black">Criminals</h3>
          <div>
            {/* Show primary (first) criminal only */}
            {(() => {
              const primaryId = (c.criminalIds && c.criminalIds.length > 0) ? c.criminalIds[0] : null;
              if (!primaryId) return <div className="text-black">No criminal linked</div>;
              const cr = criminals.find((x: any) => x.id === primaryId);
              if (!cr) return <div className="text-black">#{primaryId}</div>;
              return (
                <div className="flex gap-3 items-start p-2 border rounded bg-white">
                  <img src={norm(cr.image)} alt={cr.fullName} className="w-24 h-24 object-cover rounded" />
                  <div>
                    <div className="font-medium text-black">{cr.fullName}</div>
                    <div className="text-sm text-black">{cr.description}</div>
                    <div className="text-sm text-black">Status: {cr.status}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-black">Reports for this case</h3>
          {caseReports.length === 0 ? (
            <p className="text-black">No reports.</p>
          ) : (
            <ul className="space-y-3">
              {caseReports.map((r: any) => (
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
          )}
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-black">Activity</h3>
          <ActivityLog caseId={c.id} />
        </div>
        {/* client-only tools for police officers */}
        <div>
          <ReportForm caseId={c.id} />
          <CasePhotosManager caseId={c.id} />
          <CaseReportsClient caseId={c.id} />
        </div>
      </div>
    </div>
  );
}

