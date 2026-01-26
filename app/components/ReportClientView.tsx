"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReportReviewControls from "./ReportReviewControls";
import styles from "./ReportClientView.module.css";
import casesData from '@/data/cases.json';

export default function ReportClientView({
  reportId,
}: {
  reportId: number;
}) {
  const [report, setReport] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [sessionUser, setSessionUser] = useState<any | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [editLocation, setEditLocation] = React.useState("");
  const [editContent, setEditContent] = React.useState("");
  const [editPhotos, setEditPhotos] = React.useState("");
  const [editFps, setEditFps] = React.useState("");
  const [editStatus, setEditStatus] = React.useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("customReports");
      const arr = raw ? JSON.parse(raw) : [];
      const r = arr.find((x: any) => Number(x.id) === Number(reportId));
      if (r) setReport(r);
    } catch {}

    try {
      const uRaw = localStorage.getItem("users");
      if (uRaw) setUsers(JSON.parse(uRaw));
    } catch {}

    try {
      const s = sessionStorage.getItem("user");
      if (s) setSessionUser(JSON.parse(s));
    } catch {}
  }, [reportId]);

  // initialize edit fields when report is loaded
  useEffect(() => {
    if (!report) return;
    setEditLocation(report.location || "");
    setEditContent(report.content || "");
    setEditPhotos((report.photos || []).join(","));
    setEditFps((report.fingerprints || []).join(","));
    setEditStatus(report.status || "");
  }, [report]);

  function norm(p: string | undefined) {
    if (!p) return "";
    if (p.startsWith("/images")) return p;
    if (
      p.startsWith("/mugshots") ||
      p.startsWith("/fingerprints") ||
      p.startsWith("/places")
    )
      return `/images${p}`;
    return p;
  }

  if (!report) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.message}>Report not found (client).</div>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.message}>Report not available.</div>
      </div>
    );
  }

  const isAuthor =
    sessionUser.role === "police_officer" &&
    sessionUser.id === report.authorId;
  const isColonel = sessionUser.role === "colonel";
  if (!isAuthor && !isColonel) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.message}>Report not available.</div>
      </div>
    );
  }

  const author =
    (users || []).find((u: any) => u.id === report.authorId) || null;
  const showAuthor = author && author.role === "police_officer";

  // check review state: if colonel requested correction, author may edit
  const reviewState = report ? JSON.parse(localStorage.getItem("reportReviews") || "{}")[report.id] : null;
  const canEdit = isAuthor && reviewState && reviewState.status === "needs_correction";

  // determine current case status (custom overrides static)
  function getCaseStatus(caseId: number) {
    try {
      const customRaw = localStorage.getItem('customCases');
      const custom = customRaw ? JSON.parse(customRaw) : [];
      const found = custom.find((x: any) => Number(x.id) === Number(caseId));
      if (found && found.status) return found.status;
    } catch {}
    try {
      const all = (casesData as any).cases || [];
      const c = all.find((x: any) => Number(x.id) === Number(caseId));
      if (c) return c.status;
    } catch {}
    return null;
  }

  const caseStatus = getCaseStatus(report.caseId);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link href="/dashboard" className={styles.backLink}>
          ← Back
        </Link>

        <h1 className={styles.title}>Report #{report.id}</h1>

        <p className={styles.metaLine}>
          Case: {report.caseId} — Date: {new Date(report.date).toLocaleString()}
        </p>

        <p className={styles.fieldLine}>Officer-set status: <strong>{report.status || '—'}</strong></p>
        <p className={styles.fieldLine}>Case status: <strong>{caseStatus || '—'}</strong></p>

        <p className={styles.fieldLine}>Location: {report.location}</p>
              <p className={styles.fieldLine}>
                Author: {" "}
                {author
                  ? (author.firstName || author.username
                      ? `${author.firstName ? author.firstName : author.username} ${author.lastName ? author.lastName : ''}`.trim()
                      : String(author.id || report.authorId))
                  : "(removed - must be police)"}
              </p>

        <div className={styles.content}>{report.content}</div>
        {canEdit && !editing && (
          <div style={{ marginTop: 12 }}>
            <button className={styles.editButton} onClick={() => setEditing(true)}>Edit report (corrections requested)</button>
          </div>
        )}

        {editing && (
          <div className={styles.editBox}>
            <div className={styles.row}>
              <label className={styles.label}>Location</label>
              <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className={styles.input} />
            </div>
            <div className={styles.row}>
              <label className={styles.label}>Content</label>
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className={styles.textarea} />
            </div>
            <div className={styles.row}>
              <label className={styles.label}>Case Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={styles.input}>
                <option value="">Select status...</option>
                <option value="new">new</option>
                <option value="w_toku">w_toku</option>
                <option value="w_sadzie">w_sadzie</option>
                <option value="zamknieta">zamknieta</option>
              </select>
            </div>
            <div className={styles.row}>
              <label className={styles.label}>Photos (comma-separated)</label>
              <input value={editPhotos} onChange={(e) => setEditPhotos(e.target.value)} className={styles.input} />
            </div>
            <div className={styles.row}>
              <label className={styles.label}>Fingerprints (comma-separated)</label>
              <input value={editFps} onChange={(e) => setEditFps(e.target.value)} className={styles.input} />
            </div>
            <div className={styles.actions}>
              <button onClick={() => {
                // save and resubmit (clear review state)
                try {
                  const raw = localStorage.getItem("customReports") || "[]";
                  const arr = raw ? JSON.parse(raw) : [];
                  const idx = arr.findIndex((x: any) => Number(x.id) === Number(report.id));
                  const updated = {
                    ...report,
                    location: editLocation,
                    content: editContent,
                    photos: editPhotos ? editPhotos.split(",").map((s) => s.trim()) : [],
                    fingerprints: editFps ? editFps.split(",").map((s) => s.trim()) : [],
                    status: editStatus || report.status,
                  };
                  if (idx >= 0) {
                    arr[idx] = updated;
                    localStorage.setItem("customReports", JSON.stringify(arr));
                  } else {
                    arr.push(updated);
                    localStorage.setItem("customReports", JSON.stringify(arr));
                  }

                  // update customCases status if changed
                  try {
                    const rawCases = localStorage.getItem('customCases') || '[]';
                    const cases = rawCases ? JSON.parse(rawCases) : [];
                    const cidx = cases.findIndex((c: any) => Number(c.id) === Number(report.caseId));
                    const newStatus = updated.status || report.status;
                    if (cidx >= 0) {
                      cases[cidx].status = newStatus;
                    } else {
                      cases.push({ id: report.caseId, status: newStatus });
                    }
                    localStorage.setItem('customCases', JSON.stringify(cases));
                  } catch (err) {}

                  // clear review state so colonel receives new submission
                  try {
                    const reviews = JSON.parse(localStorage.getItem('reportReviews') || '{}');
                    if (reviews && reviews[report.id]) {
                      delete reviews[report.id];
                      localStorage.setItem('reportReviews', JSON.stringify(reviews));
                    }
                  } catch (err) {}

                  const log = JSON.parse(localStorage.getItem("activityLog") || "[]");
                  log.push({ ts: new Date().toISOString(), action: 'resubmit_report', details: `Resubmitted report ${report.id}`, reportId: report.id, userId: sessionUser.id });
                  localStorage.setItem("activityLog", JSON.stringify(log));
                } catch {}
                setEditing(false);
                // refresh
                window.location.reload();
              }} className={styles.saveButton}>Save & Resubmit</button>
              <button onClick={() => setEditing(false)} className={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        )}

        <section className={styles.section}>
          <h3 className={styles.sectionHeader}>Photos</h3>
          <div className={styles.sectionGrid}>
            {(report.photos || []).map((p: string, i: number) => (
              <img
                key={i}
                src={norm(p)}
                alt={`photo-${i}`}
                className={styles.photo}
              />
            ))}
          </div>
        </section>

        <div className={styles.reviewControls}>
          <ReportReviewControls reportId={report.id} />
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionHeader}>Fingerprints</h3>
          <div className={styles.sectionGrid}>
            {(report.fingerprints || []).map((p: string, i: number) => (
              <img
                key={i}
                src={norm(p)}
                alt={`fp-${i}`}
                className={styles.fingerprint}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
