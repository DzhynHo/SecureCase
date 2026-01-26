import React from "react";
import reportsData from "@/data/reports.json";
import usersData from "@/data/users.json";
import Link from "next/link";
import ReportReviewControls from "@/app/components/ReportReviewControls";
import ReportClientView from "@/app/components/ReportClientView";
import ReportReviewSummary from "@/app/components/ReportReviewSummary";
import ReportClientEditor from "@/app/components/ReportClientEditor";
import styles from "./report-detail.module.css";

type Props = { params: any };

export default async function ReportPage({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  const reports = (reportsData as any).reports || [];
  const r = reports.find((x: any) => x.id === id);

  if (!r) {
    // klientowy viewer dla raportów z localStorage
    return <ReportClientView reportId={id} />;
  }

  const users = (usersData as any).users || [];
  const author = users.find((u: any) => u.id === r.authorId) || null;

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

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link href="/dashboard" className={styles.backLink}>
          ← Back
        </Link>

        <h1 className={styles.title}>Report #{r.id}</h1>

        <div className={styles.reviewSummary}>
          <ReportReviewSummary reportId={r.id} />
        </div>

        <p className={styles.metaLine}>
          Case: {r.caseId} — Date: {new Date(r.date).toLocaleString()}
        </p>

        <p className={styles.fieldLine}>Location: {r.location}</p>
        <p className={styles.fieldLine}>
          Author:{" "}
          {author
            ? (author.firstName || author.username
                ? `${author.firstName ? author.firstName : author.username} ${author.lastName ? author.lastName : ''}`.trim()
                : String(author.id || r.authorId))
            : r.authorId}
        </p>

        <div className={styles.content}>{r.content}</div>

        <section className={styles.section}>
          <h3 className={styles.sectionHeader}>Photos</h3>
          <div className={styles.sectionGrid}>
            {(r.photos || []).map((p: string, i: number) => (
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
          <ReportReviewControls reportId={r.id} />
        </div>

        <div>
          <ReportClientEditor initial={r} />
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionHeader}>Fingerprints</h3>
          <div className={styles.sectionGrid}>
            {(r.fingerprints || []).map((p: string, i: number) => (
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
