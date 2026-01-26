"use client";
import React, { useEffect, useState } from "react";
import styles from "./ActivityLog.module.css";

export default function ActivityLog({ caseId }: { caseId?: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    try {
      const rawUser = sessionStorage.getItem("user");
      if (rawUser) setUser(JSON.parse(rawUser));
    } catch {}

    try {
      const all = JSON.parse(localStorage.getItem("activityLog") || "[]");
      const filtered = caseId
        ? all.filter((i: any) => i.caseId === caseId)
        : all;
      setItems(filtered.sort((a: any, b: any) => b.ts.localeCompare(a.ts)));
    } catch {
      setItems([]);
    }
  }, [caseId]);

  if (!user || user.role !== "colonel") return null;

  if (!items || items.length === 0) {
    return <div className={styles.empty}>No activity.</div>;
  }

  return (
    <div className={styles.wrapper}>
      {items.map((it: any, idx: number) => (
        <div key={idx} className={styles.item}>
          <div className={styles.meta}>
            {new Date(it.ts).toLocaleString()} — {it.username || it.userId}
          </div>
          <div className={styles.action}>{it.action}</div>
          <div className={styles.details}>{it.details}</div>
        </div>
      ))}
    </div>
  );
}
