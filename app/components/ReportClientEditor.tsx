"use client";
import React, { useEffect, useState } from "react";
import styles from "./ReportClientView.module.css";

export default function ReportClientEditor({ initial }: { initial: any }) {
  const [user, setUser] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [location, setLocation] = useState(initial.location || "");
  const [content, setContent] = useState(initial.content || "");
  const [photos, setPhotos] = useState((initial.photos || []).join(","));
  const [fps, setFps] = useState((initial.fingerprints || []).join(","));
  const [status, setStatus] = useState(initial.status || "");

  useEffect(() => {
    try { const s = sessionStorage.getItem('user'); if (s) setUser(JSON.parse(s)); } catch {}
  }, []);

  if (!user) return null;

  const isAuthor = user.role === 'police_officer' && Number(user.id) === Number(initial.authorId);

  // check if colonel requested correction
  const reviewState = JSON.parse(localStorage.getItem('reportReviews') || '{}')[initial.id] || null;
  const canEdit = isAuthor && reviewState && reviewState.status === 'needs_correction';

  if (!canEdit) return null;

  function save() {
    try {
      const raw = localStorage.getItem('customReports') || '[]';
      const arr = raw ? JSON.parse(raw) : [];
      const idx = arr.findIndex((x: any) => Number(x.id) === Number(initial.id));
      const updated = {
        ...initial,
        location,
        content,
        photos: photos ? photos.split(',').map((s: string) => s.trim()) : [],
        fingerprints: fps ? fps.split(',').map((s: string) => s.trim()) : [],
        status: status || initial.status,
      };
      if (idx >= 0) arr[idx] = updated; else arr.push(updated);
      localStorage.setItem('customReports', JSON.stringify(arr));

      // update customCases status
      try {
        const rawCases = localStorage.getItem('customCases') || '[]';
        const cases = rawCases ? JSON.parse(rawCases) : [];
        const cidx = cases.findIndex((c: any) => Number(c.id) === Number(initial.caseId));
        const newStatus = updated.status || initial.status;
        if (cidx >= 0) cases[cidx].status = newStatus; else cases.push({ id: initial.caseId, status: newStatus });
        localStorage.setItem('customCases', JSON.stringify(cases));
      } catch (err) {}

      // clear review
      try {
        const reviews = JSON.parse(localStorage.getItem('reportReviews') || '{}');
        if (reviews && reviews[initial.id]) { delete reviews[initial.id]; localStorage.setItem('reportReviews', JSON.stringify(reviews)); }
      } catch (err) {}

      const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
      log.push({ ts: new Date().toISOString(), action: 'resubmit_report', details: `Resubmitted report ${initial.id}`, reportId: initial.id, userId: user.id });
      localStorage.setItem('activityLog', JSON.stringify(log));

      setEditing(false);
      window.location.reload();
    } catch (err) { console.error(err); alert('Save failed'); }
  }

  return (
    <div style={{ marginTop: 12 }}>
      {!editing && <button className={styles.editButton} onClick={() => setEditing(true)}>Edit report (corrections requested)</button>}
      {editing && (
        <div className={styles.editBox}>
          <div className={styles.row}>
            <label className={styles.label}>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={styles.input} />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className={styles.textarea} />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Case Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.input}>
              <option value="">(no change)</option>
              <option value="new">new</option>
              <option value="w_toku">w_toku</option>
              <option value="w_sadzie">w_sadzie</option>
              <option value="zamknieta">zamknieta</option>
            </select>
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Photos (comma-separated)</label>
            <input value={photos} onChange={(e) => setPhotos(e.target.value)} className={styles.input} />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Fingerprints (comma-separated)</label>
            <input value={fps} onChange={(e) => setFps(e.target.value)} className={styles.input} />
          </div>
          <div className={styles.actions}>
            <button onClick={save} className={styles.saveButton}>Save & Resubmit</button>
            <button onClick={() => setEditing(false)} className={styles.cancelButton}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
