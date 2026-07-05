import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onDone: () => void;
}

// Sadu-pattern SVG strip — geometric diamond/chevron motif
const SaduStrip = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 360 24"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full"
    style={{ transform: flip ? 'scaleY(-1)' : undefined }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="sadu-splash" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        {/* Diamond */}
        <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="#E9A23C" strokeWidth="1.2" opacity="0.55" />
        {/* Centre dot */}
        <circle cx="12" cy="12" r="1.5" fill="#E9A23C" opacity="0.4" />
        {/* Corner accents */}
        <line x1="0" y1="0" x2="2" y2="12" stroke="#B08968" strokeWidth="0.6" opacity="0.3" />
        <line x1="24" y1="0" x2="22" y2="12" stroke="#B08968" strokeWidth="0.6" opacity="0.3" />
      </pattern>
    </defs>
    <rect width="360" height="24" fill="url(#sadu-splash)" />
  </svg>
);

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // After 2.5s start the fade-out, then call onDone once transition ends
    const fadeTimer = setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => clearTimeout(fadeTimer);
  }, []);

  const handleTransitionEnd = () => {
    if (!visible) {
      onDone();
    }
  };

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#16100B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
        direction: 'rtl',
      }}
    >
      {/* Top Sadu border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <SaduStrip />
      </div>

      {/* Centre content */}
      <div style={{ textAlign: 'center', userSelect: 'none' }}>
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(5rem, 22vw, 9rem)',
            color: '#E9A23C',
            lineHeight: 1,
            letterSpacing: '0.02em',
            textShadow: '0 0 60px rgba(233,162,60,0.35)',
            margin: 0,
          }}
        >
          جاوب
        </h1>
        <p
          style={{
            marginTop: '0.75rem',
            fontSize: 'clamp(1rem, 4vw, 1.4rem)',
            color: '#B08968',
            letterSpacing: '0.05em',
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: 400,
          }}
        >
          أسئلة الكويت
        </p>
      </div>

      {/* Bottom Sadu border */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <SaduStrip flip />
      </div>
    </div>
  );
}
