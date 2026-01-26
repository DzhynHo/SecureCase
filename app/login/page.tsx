"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setUser(data.user);

        // store session for dashboard
        try {
          sessionStorage.setItem("user", JSON.stringify(data.user));
        } catch {}

        // log login activity
        try {
          const log = JSON.parse(localStorage.getItem("activityLog") || "[]");
          log.push({
            ts: new Date().toISOString(),
            userId: data.user.id,
            username: data.user.username,
            action: "login",
            details: "User signed in",
          });
          localStorage.setItem("activityLog", JSON.stringify(log));
        } catch {}

        setMessage(`Logged in as ${data.user.username} (${data.user.role})`);
        router.push("/dashboard");
      } else {
        setMessage(data.message || data.error || "Login failed");
      }
    } catch (err: any) {
      setMessage(String(err));
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* warstwa z literkami w tle */}
      

      <div className={styles.card}>
    

        <h1 className={styles.title}>Sign in</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="username"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="password"
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.button}>
              Sign in
            </button>
          </div>
        </form>

        <div className={styles.testAccounts}>
          <p>Test accounts — click to autofill:</p>
          <div className={styles.testButtonsRow}>
            <button
              className={styles.testButton}
              onClick={() => {
                setUsername("yana.trotsenko");
                setPassword("password");
              }}
            >
              yana.trotsenko
            </button>
            <button
              className={styles.testButton}
              onClick={() => {
                setUsername("valeriia.khylchenko");
                setPassword("password");
              }}
            >
              valeriia.khylchenko
            </button>
            <button
              className={styles.testButton}
              onClick={() => {
                setUsername("nico.walker");
                setPassword("password");
              }}
            >
              nico.walker
            </button>
          </div>
        </div>

        {message && <p className={styles.message}>{message}</p>}

        {user && (
          <div className={styles.userBox}>
            <p>
              <strong>ID:</strong> {user.id}
            </p>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </div>
        )}

        <p className={styles.hint}>
          Password for testing: <strong>password</strong>
        </p>
      </div>
    </div>
  );
}
