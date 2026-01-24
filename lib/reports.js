import { loadJSON } from "./data";

export function getAllReports() {
  return loadJSON("reports.json").reports;
}

export function getReportsByCase(caseId) {
  return getAllReports().filter(r => r.caseId === caseId);
}
