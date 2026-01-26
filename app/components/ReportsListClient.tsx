"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReportReviewSummary from "./ReportReviewSummary";
import styles from "./ReportsListClient.module.css";

export default function ReportsListClient({ reports }: { reports: any[] }) {
  const [user, setUser] = useState<any | null>(null);
  const [deleted, setDeleted] = useState<number[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    try {
      const d = JSON.parse(localStorage.getItem("deletedReports") || "[]");
      setDeleted(d);
    } catch {
      setDeleted([]);
    }
  }, []);

  useEffect(() => {
    try {
      const localRaw = localStorage.getItem("customReports");
      const local = localRaw ? JSON.parse(localRaw) : [];
      const localMarked = (local || []).map((r: any) => ({
        ...r,
        _isLocal: true,
      }));
      // merge local first so local entries override static ones with same id
      const merged = [...localMarked, ...(reports || [])];
      // deduplicate by id (keep first occurrence - local overrides static)
      const seen = new Set<number>();
      const deduped: any[] = [];
      for (const it of merged) {
        const idVal = Number(it?.id);
        if (!seen.has(idVal)) {
          seen.add(idVal);
          deduped.push(it);
        }
      }
      const visible = deduped.filter((r: any) => !deleted.includes(r.id));
      visible.sort((a: any, b: any) =>
        (b.date || "").localeCompare(a.date || "")
      );
      setItems(visible);
    } catch (err) {
      setItems(reports.filter((r) => !deleted.includes(r.id)));
    }
  }, [reports, deleted]);

  function deleteReport(id: number) {
    if (!confirm("Delete report #" + id + "?")) return;
    try {
      const d = JSON.parse(localStorage.getItem("deletedReports") || "[]");
      d.push(id);
      localStorage.setItem("deletedReports", JSON.stringify(d));
      setDeleted(d);

      const log = JSON.parse(localStorage.getItem("activityLog") || "[]");
      log.push({
        ts: new Date().toISOString(),
        username: user?.username,
        action: "delete_report",
        details: `Deleted report ${id}`,
        reportId: id,
      });
      localStorage.setItem("activityLog", JSON.stringify(log));
    } catch {}
  }

  if (!items || items.length === 0) {
    return <p className={styles.empty}>No reports available.</p>;
  }

  return (
    <ul className={styles.list}>
      {items.map((r: any) => (
        <li key={r.id} className={styles.item}>
          <div className={styles.rowTop}>
            <Link href={`/reports/${r.id}`} className={styles.linkBlock}>
              <div className={styles.title}>
                Report #{r.id} — Case {r.caseId}{" "}
                {r._isLocal && (
                  <span className={styles.titleLocal}>(local)</span>
                )}
              </div>
              <div className={styles.meta}>
                {new Date(r.date).toLocaleString()} — {r.location} {r.status ? ` — status: ${r.status}` : ''}
              </div>
            </Link>

            <div className={styles.actions}>
              <ReportReviewSummary reportId={r.id} />
              {user && user.role === "colonel" && (
                <button
                  onClick={() => deleteReport(r.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <div className={styles.body}>{r.content}</div>
        </li>
      ))}
    </ul>
  );
}
