import React from "react";
import reportsData from "@/data/reports.json";
import usersData from "@/data/users.json";
import Link from "next/link";
import ReportReviewControls from '@/app/components/ReportReviewControls';
import ReportClientView from '@/app/components/ReportClientView';
import ReportReviewSummary from '@/app/components/ReportReviewSummary';

type Props = { params: any };

export default async function ReportPage({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  const reports = (reportsData as any).reports || [];
  const r = reports.find((x: any) => x.id === id);
  if (!r) {
    // render client-side viewer that reads localStorage (for reports created in-browser)
    return <ReportClientView reportId={id} />;
  }

  const users = (usersData as any).users || [];
  const author = users.find((u: any) => u.id === r.authorId);

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
        <h1 className="text-2xl font-bold mt-4">Report #{r.id}</h1>
        <div className="mt-2"><ReportReviewSummary reportId={r.id} /></div>
        <p className="text-sm text-black mt-2">Case: {r.caseId} — Date: {new Date(r.date).toLocaleString()}</p>
        <p className="mt-3 text-black">Location: {r.location}</p>
        <p className="mt-3 text-black">Author: {author ? `${author.firstName} ${author.lastName}` : r.authorId}</p>

        <div className="mt-4 text-black">{r.content}</div>

        <div className="mt-4">
          <h3 className="font-semibold text-black">Photos</h3>
          <div className="flex gap-2 flex-wrap mt-2">
            {(r.photos || []).map((p: string, i: number) => (
              <img key={i} src={norm(p)} alt={`photo-${i}`} className="w-48 h-32 object-cover rounded border" style={{ height: 'auto' }} />
            ))}
          </div>
        </div>

        {/* colonel review controls (client) */}
        <div>
          {/* client-side review controls for colonel */}
          <ReportReviewControls reportId={r.id} />
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-black">Fingerprints</h3>
          <div className="flex gap-2 flex-wrap mt-2">
            {(r.fingerprints || []).map((p: string, i: number) => (
              <img key={i} src={norm(p)} alt={`fp-${i}`} className="w-32 h-32 object-cover rounded border" style={{ height: 'auto' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
