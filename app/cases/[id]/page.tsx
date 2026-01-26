import React from "react";
import casesData from "@/data/cases.json";
import criminalsData from "@/data/criminals.json";
import usersData from "@/data/users.json";
import reportsData from "@/data/reports.json";
import Link from "next/link";
import ReportForm from "../../components/ReportForm";
import ReportReviewSummary from "@/app/components/ReportReviewSummary";
import CaseReportsClient from "@/app/components/CaseReportsClient";
import CasePhotosManager from "@/app/components/CasePhotosManager";
import styles from "./case-detail.module.css";

type Props = { params: any };

export default async function CasePage({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  const allCases = (casesData as any).cases || [];
  const c = allCases.find((x: any) => x.id === id);
  if (!c) return <div className={styles.wrapper}>Case not found</div>;

  const criminals = (criminalsData as any).criminals || [];
  const users = (usersData as any).users || [];
  const reports = (reportsData as any).reports || [];

  const assignedUser = users.find((u: any) => u.id === c.assignedUserId);
  const caseReports = reports.filter((r: any) => r.caseId === c.id);

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

  const primaryCriminalId =
    c.criminalIds && c.criminalIds.length > 0 ? c.criminalIds[0] : null;
  const primaryCriminal = primaryCriminalId
    ? criminals.find((x: any) => x.id === primaryCriminalId)
    : null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link href="/dashboard" className={styles.backLink}>
          ← Back
        </Link>

        <h1 className={styles.title}>
          {c.number} — {c.title}
        </h1>
        <p className={styles.status}>Status: {c.status}</p>
        <p className={styles.description}>{c.description}</p>

        <div className={styles.sectionsGrid}>
          {/* LEWA KOLUMNA: officer + criminals + reports */}
          <div className={styles.column}>
            <section className={styles.section}>
              <h3 className={styles.sectionHeader}>Assigned officer</h3>
              <p className={styles.assignedOfficer}>
                {assignedUser ? (
                  <>
                    {assignedUser.firstName} {assignedUser.lastName} (
                    {assignedUser.username})
                  </>
                ) : (
                  <span className={styles.sectionMuted}>Not assigned</span>
                )}
              </p>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionHeader}>Criminals</h3>
              {!primaryCriminal && (
                <p className={styles.sectionMuted}>No criminal linked.</p>
              )}
              {primaryCriminal && (
                <div className={styles.criminalCard}>
                  <img
                    src={norm(primaryCriminal.image)}
                    alt={primaryCriminal.fullName}
                    className={styles.criminalImage}
                  />
                  <div>
                    <div className={styles.criminalName}>
                      {primaryCriminal.fullName}
                    </div>
                    <div className={styles.criminalDesc}>
                      {primaryCriminal.description}
                    </div>
                    <div className={styles.sectionText}>
                      Status: {primaryCriminal.status}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionHeader}>Reports for this case</h3>
              {caseReports.length === 0 ? (
                <p className={styles.sectionMuted}>No reports.</p>
              ) : (
                <ul className={styles.caseReportsList}>
                  {caseReports.map((r: any) => (
                    <li key={r.id} className={styles.caseReportItem}>
                      <div className={styles.caseReportTop}>
                        <Link
                          href={`/reports/${r.id}`}
                          className={styles.caseReportLink}
                        >
                          <div className={styles.caseReportTitle}>
                            Report #{r.id} —{" "}
                            {new Date(r.date).toLocaleString()}
                          </div>
                          <div className={styles.caseReportMeta}>
                            {r.location}
                          </div>
                        </Link>
                        <ReportReviewSummary reportId={r.id} />
                      </div>
                      <div className={styles.caseReportBody}>{r.content}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* PRAWA KOLUMNA: activity */}
          
        </div>

        {/* narzędzia klientowe (raport + zdjęcia + podgląd) */}
        <section className={styles.toolsSection}>
          <ReportForm caseId={c.id} />
          <CasePhotosManager caseId={c.id} />
          <CaseReportsClient caseId={c.id} />
        </section>
      </div>
    </div>
  );
}
