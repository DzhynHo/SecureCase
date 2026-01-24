import { loadJSON } from "./data";

export function login(username, password) {
  const users = loadJSON("users.json").users;
  const user = users.find(u => u.username === username);
  if (!user) return null;

  // na razie porównujemy hasło wprost dla prostoty (możesz dodać bcrypt)
  if (password === "123456") return user;
  return null;
}
