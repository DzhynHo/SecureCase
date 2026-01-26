"use client";
import React, { useEffect, useState } from "react";
import casesData from "@/data/cases.json";
import criminalsData from "@/data/criminals.json";
import usersData from "@/data/users.json";
import Link from "next/link";
import ReportForm from "./ReportForm";
import CasePhotosManager from "./CasePhotosManager";
import CaseReportsClient from "./CaseReportsClient";
import styles from "../cases/[id]/case-detail.module.css";

export default function CaseClientLoader({ caseId }: { caseId: number }) {
  const [c, setC] = useState<any | null>(null);

  useEffect(() => {
    try {
      const staticCases = (casesData as any).cases || [];
      const localRaw = localStorage.getItem('customCases') || '[]';
      const local = localRaw ? JSON.parse(localRaw) : [];
      // merge custom criminals as well
      const staticCriminals = (criminalsData as any).criminals || [];
      const customCrimRaw = localStorage.getItem('customCriminals') || '[]';
      const customCrim = customCrimRaw ? JSON.parse(customCrimRaw) : [];
      const combinedCriminals = [...customCrim, ...staticCriminals];
      const combined = [...local, ...staticCases];
      const delRaw = localStorage.getItem('deletedCaseIds') || '[]';
      const deleted = delRaw ? JSON.parse(delRaw) : [];
      const visible = combined.filter((x: any) => !deleted.includes(Number(x.id)));
      const seen = new Set<number>();
      const unique: any[] = [];
      for (const item of visible) {
        const idVal = Number(item.id);
        if (!seen.has(idVal)) { seen.add(idVal); unique.push(item); }
      }
      const found = unique.find((x: any) => Number(x.id) === Number(caseId));
      if (found) setC(found);
    } catch {}
  }, [caseId]);

  if (!c) return <div className={styles.wrapper}>Case not found</div>;

  // combine static + custom criminals for display
  const staticCriminals = (criminalsData as any).criminals || [];
  const customCrimRaw = typeof window !== 'undefined' ? localStorage.getItem('customCriminals') || '[]' : '[]';
  const customCrim = customCrimRaw ? JSON.parse(customCrimRaw) : [];
  const criminals = [...customCrim, ...staticCriminals];
  const users = (usersData as any).users || [];
  const assignedUser = users.find((u: any) => u.id === c.assignedUserId);

  function norm(p: string | undefined) {
    if (!p) return "";
    if (p.startsWith("/images")) return p;
    if (p.startsWith("/mugshots") || p.startsWith("/fingerprints") || p.startsWith("/places")) return `/images${p}`;
    return p;
  }

  const primaryCriminalId = c.criminalId ? c.criminalId : null;
  const primaryCriminal = primaryCriminalId ? criminals.find((x: any) => x.id === primaryCriminalId) : null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link href="/dashboard" className={styles.backLink}>← Back</Link>
        <h1 className={styles.title}>{c.number} — {c.title}</h1>
        <p className={styles.status}>Status: {c.status}</p>
        <p className={styles.description}>{c.description}</p>

        <div className={styles.sectionsGrid}>
          <div className={styles.column}>
            <section className={styles.section}>
              <h3 className={styles.sectionHeader}>Assigned officer</h3>
              <p className={styles.assignedOfficer}>{assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName} (${assignedUser.username})` : <span className={styles.sectionMuted}>Not assigned</span>}</p>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionHeader}>Criminals</h3>
              {!primaryCriminal && (<p className={styles.sectionMuted}>No criminal linked.</p>)}
              {primaryCriminal && (
                <div className={styles.criminalCard}>
                  <img src={norm(primaryCriminal.image)} alt={primaryCriminal.fullName} className={styles.criminalImage} />
                  <div>
                    <div className={styles.criminalName}>{primaryCriminal.fullName}</div>
                    <div className={styles.criminalDesc}>{primaryCriminal.description}</div>
                    <div className={styles.sectionText}>Status: {primaryCriminal.status}</div>
                  </div>
                </div>
              )}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionHeader}>Reports for this case</h3>
              <CaseReportsClient caseId={c.id} />
            </section>
          </div>
        </div>

        <section className={styles.toolsSection}>
          <ReportForm caseId={c.id} />
          <CasePhotosManager caseId={c.id} />
        </section>
      </div>
    </div>
  );
}
