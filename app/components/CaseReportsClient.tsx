"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReportReviewSummary from "./ReportReviewSummary";
import styles from "./CaseReportsClient.module.css";

export default function CaseReportsClient({ caseId }: { caseId: number }) {
  const [reports, setReports] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("customReports");
      const arr = raw ? JSON.parse(raw) : [];
      const mine = arr.filter(
        (r: any) => Number(r.caseId) === Number(caseId)
      );
      setReports(mine);
    } catch (err) {
      setReports([]);
    }
  }, [caseId]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  if (!user || user.role !== "police_officer") return null;
  if (reports.length === 0) return null;

  function removeReport(id: string | number) {
    if (!confirm("Remove this local report?")) return;
    try {
      const raw = localStorage.getItem("customReports") || "[]";
      let arr = JSON.parse(raw || "[]");
      arr = arr.filter((x: any) => String(x.id) !== String(id));
      localStorage.setItem("customReports", JSON.stringify(arr));
      setReports((prev) => prev.filter((r) => String(r.id) !== String(id)));
      // log activity
      try {
        const alKey = "activityLog";
        const rawAl = localStorage.getItem(alKey) || "[]";
        const al = JSON.parse(rawAl || "[]");
        al.push({ time: new Date().toISOString(), action: `Deleted local report ${id}` });
        localStorage.setItem(alKey, JSON.stringify(al));
      } catch {}
    } catch (err) {
      // ignore
    }
  }

  return (
    <div className={styles.wrapper}>
      <h4 className={styles.title}>Local reports for this case</h4>
      <ul className={styles.list}>
        {reports.map((r) => (
          <li key={r.id} className={styles.item}>
            <div className={styles.topRow}>
              <Link href={`/reports/${r.id}`} className={styles.link}>
                <div className={styles.itemTitle}>
                  Report #{r.id} — {new Date(r.date).toLocaleString()}
                </div>
                <div className={styles.itemMeta}>{r.location}</div>
              </Link>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <ReportReviewSummary reportId={r.id} />
                <button className={styles.deleteBtn} onClick={() => removeReport(r.id)}>Delete</button>
              </div>
            </div>
            <div className={styles.body}>{r.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
