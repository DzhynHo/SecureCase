"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./ReportForm.module.css";
import casesData from "@/data/cases.json";

export default function ReportForm({ caseId }: { caseId: number }) {
  const [user, setUser] = useState<any | null>(null);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState("");
  const [fingerprints, setFingerprints] = useState("");
  const [status, setStatus] = useState<string>("new"); // добавили статус
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  function getCaseStatus(caseId: number) {
    try {
      const customRaw = localStorage.getItem("customCases");
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

  const currentStatus = getCaseStatus(caseId);

  if (!user || user.role !== "police_officer") return null;
  if (currentStatus === "zamknieta") {
    return (
      <div className={styles.wrapper}>
        <h4 className={styles.title}>Create report for this case</h4>
        <div className={styles.message}>
          Cannot create reports for closed cases.
        </div>
      </div>
    );
  }

  function saveToLocal(report: any) {
    const existing = JSON.parse(localStorage.getItem("customReports") || "[]");
    existing.push(report);
    localStorage.setItem("customReports", JSON.stringify(existing));

    // обновляем статус дела
    const rawCases = localStorage.getItem("customCases") || "[]";
    const cases = rawCases ? JSON.parse(rawCases) : [];
    const idx = cases.findIndex((x: any) => Number(x.id) === Number(caseId));
    if (idx >= 0) {
      cases[idx].status = status;
    } else {
      cases.push({ id: caseId, status });
    }
    localStorage.setItem("customCases", JSON.stringify(cases));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!status) {
      alert("Please select a status before submitting the report.");
      return;
    }

    const id = Date.now();
    const r = {
      id,
      caseId,
      authorId: user.id,
      date: new Date().toISOString(),
      location,
      content,
      photos: photos ? photos.split(",").map((s) => s.trim()) : [],
      fingerprints: fingerprints
        ? fingerprints.split(",").map((s) => s.trim())
        : [],
      status, // сохраняем выбранный статус
    };

    saveToLocal(r);

    try {
      const log = JSON.parse(localStorage.getItem("activityLog") || "[]");
      log.push({
        ts: new Date().toISOString(),
        userId: user.id,
        username: user.username,
        action: "create_report",
        details: `Created report ${id} for case ${caseId} with status '${status}'`,
        caseId,
        reportId: id,
      });
      localStorage.setItem("activityLog", JSON.stringify(log));
    } catch {}

    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const exists = users.find((u: any) => u.id === user.id);
      if (!exists) {
        users.push({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          role: user.role,
        });
        localStorage.setItem("users", JSON.stringify(users));
      }
    } catch {}

    router.push(`/reports/${id}`);
  }

  return (
    <form onSubmit={submit} className={styles.wrapper}>
      <h4 className={styles.title}>Create report for this case</h4>

      <div className={styles.row}>
        <label className={styles.label}>Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Warsaw, ul. Marszałkowska 5"
          className={styles.input}
        />
      </div>

      <div className={styles.row}>
        <label className={styles.label}>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Short description of the incident..."
          className={styles.textarea}
        />
      </div>

      <div className={styles.row}>
        <label className={styles.label}>Photos (comma-separated URLs)</label>
        <input
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.row}>
        <label className={styles.label}>
          Fingerprints (comma-separated URLs)
        </label>
        <input
          value={fingerprints}
          onChange={(e) => setFingerprints(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.row}>
        <label className={styles.label}>Case Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={styles.input}
        >
          <option value="">Select status...</option>
          <option value="new">new</option>
          <option value="w_toku">w_toku</option>
          <option value="w_sadzie">w_sadzie</option>
          <option value="zamknieta">zamknieta</option>
        </select>
      </div>

      <div className={styles.actions}>
        <button className={styles.submit} type="submit">
          Submit report
        </button>
      </div>
    </form>
  );
}
