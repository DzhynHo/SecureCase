"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';

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
          sessionStorage.setItem('user', JSON.stringify(data.user));
        } catch {}
        // log login activity
        try {
          const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
          log.push({ ts: new Date().toISOString(), userId: data.user.id, username: data.user.username, action: 'login', details: 'User signed in' });
          localStorage.setItem('activityLog', JSON.stringify(log));
        } catch {}
        setMessage(`Logged in as ${data.user.username} (${data.user.role})`);
        // redirect to dashboard
        router.push('/dashboard');
      } else {
        setMessage(data.message || data.error || "Login failed");
      }
    } catch (err: any) {
      setMessage(String(err));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-extrabold mb-4 text-center">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="password"
            />
          </div>
          <div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded font-medium">
              Sign in
            </button>
          </div>
        </form>

        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Test accounts — click to autofill:</p>
          <div className="flex gap-2">
            <button
              className="flex-1 border border-gray-200 px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 text-sm"
              onClick={() => { setUsername('yana.trotsenko'); setPassword('password'); }}
            >
              yana.trotsenko
            </button>
            <button
              className="flex-1 border border-gray-200 px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 text-sm"
              onClick={() => { setUsername('valeriia.khylchenko'); setPassword('password'); }}
            >
              valeriia.khylchenko
            </button>
            <button
              className="flex-1 border border-gray-200 px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 text-sm"
              onClick={() => { setUsername('nico.walker'); setPassword('password'); }}
            >
              nico.walker
            </button>
          </div>
        </div>

        {message && <p className="mt-4 text-sm text-center">{message}</p>}

        {user && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
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

        <p className="mt-4 text-xs text-gray-500">Password for testing: <strong>password</strong></p>
      </div>
    </div>
  );
}
