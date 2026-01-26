"use client";

import React from "react";
import { useRouter } from "next/navigation";
import StartOverlay from "./components/StartOverlay";
import styles from "./home.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <StartOverlay />

      <div className={styles.wrapper}>
        {/* TOP BAR */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={styles.title}>Welcome to Securecase</div>
            <div className={styles.subtitle}>
              System bezpiecznego zarządzania sprawami i raportami
            </div>
          </div>

          <div className={styles.topBarRight}>
            <button
              className={styles.topButton}
              onClick={() => router.push("/login")}
            >
              Sign in
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.grid}>
          <div className={styles.cardWide}>
            <div className={styles.cardTitle}>Getting started</div>
            <p className={styles.muted}>
              Securecase umożliwia zarządzanie sprawami, raportami oraz
              dziennikiem aktywności w jednym bezpiecznym miejscu.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Features</div>
            <ul className={styles.simpleList}>
              <li className={styles.simpleListItem}>
                Zarządzanie sprawami
              </li>
              <li className={styles.simpleListItem}>
                Raporty niestandardowe
              </li>
              <li className={styles.simpleListItem}>
                Rejestr aktywności
              </li>
            </ul>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Security</div>
            <p className={styles.mutedSmall}>
              Dane są przechowywane lokalnie. Użytkownik ma pełną kontrolę
              nad eksportem, importem oraz synchronizacją danych.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
