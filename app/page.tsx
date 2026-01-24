import React from "react";
import StartOverlay from "./components/StartOverlay";

export default function Home() {
  return (
    <>
      <StartOverlay />

      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to Securecase</h1>
          <p className="text-gray-600">Click the Start button to sign in.</p>
        </div>
      </main>
    </>
  );
}
