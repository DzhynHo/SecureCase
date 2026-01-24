import { loadJSON } from "./data";

// Pobiera wszystkich przestępców
export function getAllCriminals() {
  return loadJSON("criminals.json").criminals;
}

// Pobiera przestępcę po ID
export function getCriminalById(id) {
  return getAllCriminals().find(criminal => criminal.id === id);
}

// Filtrowanie przestępców po statusie
export function getCriminalsByStatus(status) {
  return getAllCriminals().filter(criminal => criminal.status === status);
}

// Pobiera przestępców powiązanych z konkretną sprawą
export function getCriminalsByCase(caseId) {
  return getAllCriminals().filter(criminal =>
    criminal.caseIds.includes(caseId)
  );
}

// Wyszukiwanie przestępców po imieniu lub nazwisku (częściowe dopasowanie)
export function searchCriminals(query) {
  const q = query.toLowerCase();
  return getAllCriminals().filter(criminal =>
    criminal.fullName.toLowerCase().includes(q)
  );
}
