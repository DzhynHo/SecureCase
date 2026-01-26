"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReportReviewSummary from "@/app/components/ReportReviewSummary";
import ActivityLog from "@/app/components/ActivityLog";
import ReportsListClient from "@/app/components/ReportsListClient";
import casesData from "@/data/cases.json";
import reportsData from "@/data/reports.json";
import usersData from "@/data/users.json";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [createdCases, setCreatedCases] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("user");
      if (!raw) {
        router.push("/login");
        return;
      }
      const u = JSON.parse(raw);
      setUser(u);

      const allCases = (casesData as any).cases || [];
      if (u.role === "police_officer") {
        const mine = allCases.filter((c: any) => c.assignedUserId === u.id);
        setCases(mine);
      } else {
        setCases([]);
      }
    } catch (err) {
      setMsg("Failed to load session");
    }
  }, [router]);

  if (!user) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.wrapper}>
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h2 className={styles.title}>
            Welcome, {user.firstName || user.username}
          </h2>
          <p className={styles.subtitle}>Role: {user.role}</p>
        </div>
        <div className={styles.topBarRight}>
          {user.role === "police_officer" && (
            <button
              className={styles.topButton}
              onClick={() => router.push("/cases")}
            >
              All cases
            </button>
          )}
         
          <button
            className={styles.topButtonSecondary}
            onClick={() => {
              sessionStorage.removeItem("user");
              router.push("/");
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.grid}>
              {user.role === "police_officer" && (
        <>
          <section className={styles.cardWide}>
            <h3 className={styles.cardTitle}>My cases</h3>
            {cases.length === 0 ? (
              <p className={styles.muted}>You have no assigned cases.</p>
            ) : (
              <FilteredCaseList cases={cases} />
            )}
          </section>

          <section className={styles.cardTall}>
            <h3 className={styles.cardTitle}>My reports</h3>
            <ReportsForOfficer casesList={cases} />
          </section>

          {user.username === "nico.walker" && (
            <section className={styles.cardTall}>
              <h3 className={styles.cardTitle}>Activity log</h3>
              <ActivityLog />
            </section>
          )}
        </>
      )}


      {user.role === "colonel" && (
  <section className={styles.cols2}>
    {/* LEWA KOLUMNA */}
    <div className={styles.col}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Create new case</h3>
        <p className={styles.mutedSmall}>
          Quickly open a new case and keep track of it locally.
        </p>
        <CreateCaseForm
          onCreate={(c) => setCreatedCases((s) => [c, ...s])}
        />
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Reports</h3>
        <ReportsListClient
          reports={(reportsData as any).reports || []}
        />
      </div>
    </div>

    {/* PRAWA KOLUMNA */}
    
    <div className={styles.col}>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Officers</h3>
        <OfficersList />
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Activity log</h3>
        <ActivityLog />
      </div>

    </div>
  </section>
)}



      </main>

      {(msg || createdCases.length > 0) && (
        <aside className={styles.bottomPanel}>
          {msg && <div className={styles.alert}>{msg}</div>}
          {createdCases.length > 0 && (
            <div>
              <h4 className={styles.bottomTitle}>Recently created (local)</h4>
              <ul className={styles.simpleList}>
                {createdCases.map((c, idx) => (
                  <li key={idx} className={styles.simpleListItem}>
                    <div className={styles.simpleListMain}>
                      {c.number} — {c.title}
                    </div>
                    <div className={styles.simpleListSub}>
                      {c.description || "No description"}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}

function OfficersList() {
  const users = (usersData as any).users || [];
  const officers = users.filter((u: any) => u.role === "police_officer");
  if (officers.length === 0)
    return <p className={styles.muted}>No officers found.</p>;
  return (
    <ul className={styles.simpleList}>
      {officers.map((o: any) => (
        <li key={o.id} className={styles.simpleListItem}>
          <div className={styles.simpleListMain}>
            {o.firstName} {o.lastName} ({o.username})
          </div>
          <div className={styles.simpleListSub}>
            Assigned cases:{" "}
            {o.assignedCaseIds ? o.assignedCaseIds.length : 0}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ReportsForOfficer({ casesList }: { casesList: any[] }) {
  const allReports = (reportsData as any).reports || [];
  const myReports = allReports.filter((r: any) =>
    casesList.some((c) => c.id === r.caseId)
  );
  if (myReports.length === 0)
    return <p className={styles.muted}>No reports for your cases.</p>;
  return (
    <ul className={styles.simpleList}>
      {myReports.map((r: any) => (
        <li key={r.id} className={styles.simpleListItem}>
          <div className={styles.simpleListRow}>
            <Link href={`/reports/${r.id}`} className={styles.linkBlock}>
              <div className={styles.simpleListMain}>
                Report #{r.id} — Case {r.caseId}
              </div>
              <div className={styles.simpleListSub}>
                {new Date(r.date).toLocaleString()} — {r.location}
              </div>
            </Link>
            <div className={styles.badgeWrapper}>
              <ReportReviewSummary reportId={r.id} />
            </div>
          </div>
          <div className={styles.simpleListBody}>{r.content}</div>
        </li>
      ))}
    </ul>
  );
}

function FilteredCaseList({ cases }: { cases: any[] }) {
  const [filter, setFilter] = useState<
    "to_review" | "in_progress" | "closed" | "all"
  >("all");

  function matches(c: any) {
    if (filter === "all") return true;
    if (filter === "in_progress") return c.status === "w_toku";
    if (filter === "closed") return c.status === "zamknieta";
    if (filter === "to_review") return c.status === "w_sadzie" || c.status === "nowe";
    return true;
  }

  const list = cases.filter(matches);

  return (
    <div>
      <div className={styles.filterRow}>
        <button
          onClick={() => setFilter("all")}
          className={`${styles.filterButton} ${
            filter === "all" ? styles.filterButtonActive : ""
          }`}
        >
          Wszystkie
        </button>
        <button
          onClick={() => setFilter("to_review")}
          className={`${styles.filterButton} ${
            filter === "to_review" ? styles.filterButtonActive : ""
          }`}
        >
          Do rozpatrzenia
        </button>
        <button
          onClick={() => setFilter("in_progress")}
          className={`${styles.filterButton} ${
            filter === "in_progress" ? styles.filterButtonActive : ""
          }`}
        >
          W trakcie
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`${styles.filterButton} ${
            filter === "closed" ? styles.filterButtonActive : ""
          }`}
        >
          Zamknięte
        </button>
      </div>

      {list.length === 0 ? (
        <p className={styles.muted}>No cases.</p>
      ) : (
        <ul className={styles.simpleList}>
          {list.map((c) => (
            <li key={c.id} className={styles.simpleListItem}>
              <Link href={`/cases/${c.id}`} className={styles.linkBlock}>
                <div className={styles.simpleListMain}>
                  {c.number} — {c.title}
                </div>
                <div className={styles.simpleListSub}>Status: {c.status}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CreateCaseForm({ onCreate }: { onCreate: (c: any) => void }) {
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!number || !title) return;
    const newCase = {
      id: Date.now(),
      number,
      title,
      description,
      status: "new",
    };
    onCreate(newCase);
    try {
      const log = JSON.parse(localStorage.getItem("activityLog") || "[]");
      log.push({
        ts: new Date().toISOString(),
        action: "create_case",
        details: `Created case ${number} - ${title}`,
        caseId: newCase.id,
      });
      localStorage.setItem("activityLog", JSON.stringify(log));
    } catch {}
    setNumber("");
    setTitle("");
    setDescription("");
  }

  return (
    <form onSubmit={submit} className={styles.formStack}>
      <input
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Case number"
        className={styles.input}
      />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className={styles.input}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className={`${styles.input} ${styles.textarea}`}
      />
      <button className={styles.primaryButton} type="submit">
        Create (local)
      </button>
    </form>
  );
}
