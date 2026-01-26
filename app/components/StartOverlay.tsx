"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./start-overlay.module.css";

const APP_NAME = "Securecase";

type FallingLetter = {
  id: number;
  char: string;
  left: number;
  delay: number;
  duration: number;
};

export default function StartOverlay() {
  const [open, setOpen] = useState(true);
  const [closing, setClosing] = useState(false);
  const [lettersBg, setLettersBg] = useState<FallingLetter[]>([]);
  const router = useRouter();

  useEffect(() => {
    const count = 200;
    const arr: FallingLetter[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      char: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 5 + Math.random() * 4,
    }));
    setLettersBg(arr);
  }, []);

  if (!open) return null;

  function handleClose() {
    if (closing) return;
    setClosing(true);

    setTimeout(() => {
      setOpen(false);
      router.push("/");
    }, 600); // должно совпадать с CSS transition
  }

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.closing : ""}`}
      onClick={handleClose}
    >
      {/* фон с падающими буквами */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {lettersBg.map((l) => (
          <span
            key={l.id}
            className={styles.fallLetter}
            style={{
              left: `${l.left}%`,
              animationDelay: `${l.delay}s`,
              animationDuration: `${l.duration}s`,
            }}
          >
            {l.char}
          </span>
        ))}
      </div>

      {/* стеклянная карточка */}
      <div className={styles.glassCard}>
        <Image
          src="/images/logo1.png"
          alt="Securecase logo"
          width={400}
          height={400}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </div>
  );
}
