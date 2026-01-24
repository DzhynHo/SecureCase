import React from "react";

import casesData from "@/data/cases.json";
import criminalsData from "@/data/criminals.json";
import reportsData from "@/data/reports.json";
import usersData from "@/data/users.json";

export default function Home() {
  const casesCount = Array.isArray((casesData as any).cases) ? (casesData as any).cases.length : 0;
  const criminalsCount = Array.isArray((criminalsData as any).criminals) ? (criminalsData as any).criminals.length : 0;
  const reportsCount = Array.isArray((reportsData as any).reports) ? (reportsData as any).reports.length : 0;
  const usersCount = Array.isArray((usersData as any).users) ? (usersData as any).users.length : 0;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">DB Check — Quick Status</h1>
        <ul className="space-y-2 text-lg">
          <li>Cases: <strong>{casesCount}</strong></li>
          <li>Criminals: <strong>{criminalsCount}</strong></li>
          <li>Reports: <strong>{reportsCount}</strong></li>
          <li>Users: <strong>{usersCount}</strong></li>
        </ul>
        <p className="mt-6 text-sm text-gray-600">This page is server-rendered and reads local JSON files for quick verification.</p>
      </div>
    </main>
  );
}
