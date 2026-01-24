"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './start-overlay.module.css';

const APP_NAME = 'Securecase';

type FallingLetter = {
  id: number;
  char: string;
  left: number;
  delay: number;
  duration: number;
};

export default function StartOverlay() {
  const [open, setOpen] = useState(true);
  const [lettersBg, setLettersBg] = useState<FallingLetter[]>([]);
  const router = useRouter();

  
  useEffect(() => {
    const count = 200; // густота
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

  return (
    <div className={styles.overlay} onClick={() => { setOpen(false); router.push('/login'); }}>
      {/* фон з падаючими літерами – тепер детермінований після першого рендера на клієнті */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
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

      <div className={styles.glassCard}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.2rem',
          }}
        >
          <Image
            src="/images/logo.png"
            alt="Securecase logo"
            width={400}
            height={400}
            style={{ objectFit: 'contain' }}
            priority
          />

          {/* only logo shown */}

        </div>
      </div>
    </div>
  );
}
