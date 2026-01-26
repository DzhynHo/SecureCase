"use client";
import React, { useState } from "react";

const KEYS = [
  "customReports",
  "customCases",
  "customCriminals",
  "casePhotos",
  "reportReviews",
  "activityLog",
  "deletedCaseIds",
  "deletedReports",
  "users",
];

export default function LocalSync() {
  const [status, setStatus] = useState<string | null>(null);

  function exportAll() {
    try {
      const dump: any = {};
      KEYS.forEach((k) => {
        try { const v = localStorage.getItem(k); if (v !== null) dump[k] = JSON.parse(v); } catch { try { dump[k] = JSON.parse(localStorage.getItem(k) || 'null'); } catch { dump[k] = localStorage.getItem(k); } }
      });
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `policyjny-local-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("Exported localStorage to file.");
    } catch (err) {
      setStatus("Export failed: " + String(err));
    }
  }

  function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const txt = String(r.result || "");
        const parsed = JSON.parse(txt);
        // write keys that exist in parsed
        Object.keys(parsed).forEach((k) => {
          try { localStorage.setItem(k, JSON.stringify(parsed[k])); } catch {}
        });
        setStatus("Import complete. Reload page to apply changes.");
      } catch (err) {
        setStatus("Import failed: invalid file");
      }
    };
    r.readAsText(f);
  }

  function importAndMergeReportsFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const txt = String(r.result || "");
        const parsed = JSON.parse(txt);
        // support either { customReports: [...] } or raw array
        const incoming: any[] = Array.isArray(parsed)
  ? parsed
  : Array.isArray(parsed.customReports)
  ? parsed.customReports
  : [];


        const key = "customReports";
        const existingRaw = localStorage.getItem(key) || "[]";
        let existing = [] as any[];
        try { existing = JSON.parse(existingRaw); } catch { existing = []; }

        const map = new Map<string | number, any>();
        existing.forEach((r) => map.set(String(r.id), r));
        let added = 0;
        incoming.forEach((ir) => {
          const id = String(ir.id ?? ir._id ?? Math.random());
          if (!map.has(id)) { map.set(id, ir); added++; }
        });

        const merged = Array.from(map.values());
        localStorage.setItem(key, JSON.stringify(merged));

        // append activity log
        try {
          const alKey = "activityLog";
          const raw = localStorage.getItem(alKey) || "[]";
          const al = JSON.parse(raw || "[]");
          al.push({
            time: new Date().toISOString(),
            action: `Imported and merged ${added} reports from file`,
          });
          localStorage.setItem(alKey, JSON.stringify(al));
        } catch {}

        setStatus(`Merge complete. ${added} new reports added. Reload to apply.`);
      } catch (err) {
        setStatus("Merge failed: invalid file");
      }
    };
    r.readAsText(f);
  }

  function clearLocal() {
    if (!confirm("Clear local app data for the keys? This cannot be undone.")) return;
    try {
      KEYS.forEach((k) => localStorage.removeItem(k));
      setStatus("Selected local keys cleared.");
    } catch (err) { setStatus("Clear failed: " + String(err)); }
  }

  return (
    <div style={{ padding: 12, borderRadius: 6, background: "#081124", color: "#fff" }}>
      <h4 style={{ margin: 0, marginBottom: 8 }}>Local storage sync</h4>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={exportAll} style={{ background: "#10b981", color: "white", padding: "6px 10px", borderRadius: 6 }}>Export</button>
        <label style={{ background: "#2563eb", color: "white", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}>
          Import
          <input type="file" accept="application/json" onChange={importFile} style={{ display: "none" }} />
        </label>

        <label style={{ background: "#7c3aed", color: "white", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}>
          Sync reports (merge)
          <input type="file" accept="application/json" onChange={importAndMergeReportsFile} style={{ display: "none" }} />
        </label>
        <button onClick={clearLocal} style={{ background: "#ef4444", color: "white", padding: "6px 10px", borderRadius: 6 }}>Clear selected</button>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#cbd5e1" }}>{status || "Keys: " + KEYS.join(", ")}</div>
    </div>
  );
}
