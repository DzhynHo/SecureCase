"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReportReviewControls from "./ReportReviewControls";
import styles from "./ReportClientView.module.css";

export default function ReportClientView({
  reportId,
}: {
  reportId: number;
}) {
  const [report, setReport] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [sessionUser, setSessionUser] = useState<any | null>(null);

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

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link href="/dashboard" className={styles.backLink}>
          ← Back
        </Link>

        <h1 className={styles.title}>Report #{report.id}</h1>

        <p className={styles.metaLine}>
          Case: {report.caseId} — Date:{" "}
          {new Date(report.date).toLocaleString()}
        </p>

        <p className={styles.fieldLine}>Location: {report.location}</p>
        <p className={styles.fieldLine}>
          Author:{" "}
          {showAuthor
            ? `${author.firstName} ${author.lastName}`
            : "(removed - must be police)"}
        </p>

        <div className={styles.content}>{report.content}</div>

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
