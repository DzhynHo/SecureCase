import { loadJSON } from "./data";

export function getAllCases() {
  return loadJSON("cases.json").cases;
}

export function getCaseById(id) {
  return getAllCases().find(c => c.id === id);
}

export function getCasesByUser(userId) {
  return getAllCases().filter(c => c.assignedUserId === userId);
}

export function getClosedCases() {
  return getAllCases().filter(c => c.status === "zamknieta");
}
