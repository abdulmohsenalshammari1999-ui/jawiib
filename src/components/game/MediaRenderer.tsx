import { useState, useRef, useEffect } from 'react';

// ── Image ─────────────────────────────────────────────────────────────────────

interface ImageMediaProps {
  src: string;
  alt?: string;
  caption?: string;
  /** When provided alongside maxTimer, image starts blurred and clears as timer counts down */
  progressive?: boolean;
  timer?: number;
  maxTimer?: number;
}

export function ImageMedia({ src, alt = '', caption, progressive, timer, maxTimer }: ImageMediaProps) {
  const [zoomed, setZoomed] = useState(false);
  const [failed, setFailed] = useState(false);

  // Progressive reveal: blur starts at 18px when timer = maxTimer, reaches 0 when timer ≤ 20% remaining
  const blurPx = progressive && timer != null && maxTimer
    ? Math.max(0, Math.round(18 * (timer / maxTimer) * 1.25))
    : 0;

  if (failed) {
    return (
      <div
        className="w-full rounded-2xl border border-jawwib-border flex flex-col items-center justify-center gap-2"
        style={{ height: '180px', background: 'linear-gradient(135deg,#1C1208 0%,#2A1A0A 100%)' }}
      >
        <span className="text-5xl opacity-40">🖼️</span>
        {alt && (
          <p className="text-xs font-bold text-white/35 text-center px-4 leading-snug max-w-[220px]">{alt}</p>
        )}
        <p className="text-[10px] text-white/20 font-medium">الصورة غير متاحة</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-jawwib-border shadow-sm"
        onClick={blurPx === 0 ? () => setZoomed(true) : undefined}
        style={{ maxHeight: '240px', cursor: blurPx === 0 ? 'zoom-in' : 'default' }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ maxHeight: '240px', filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none', transition: 'filter 1s linear' }}
          loading="lazy"
          onError={() => setFailed(true)}
        />
        {blurPx > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/80 font-black text-sm bg-black/40 px-3 py-1 rounded-full">
              🔍 الصورة تتضح مع الوقت...
            </span>
          </div>
        )}
        {blurPx === 0 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            🔍 اضغط للتكبير
          </div>
        )}
      </div>
      {caption && (
        <p className="text-center text-xs text-jawwib-text-dim mt-1">{caption}</p>
      )}

      {/* Fullscreen zoom overlay */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 text-white font-black text-lg"
            onClick={() => setZoomed(false)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

// ── Audio ─────────────────────────────────────────────────────────────────────

interface AudioMediaProps {
  src: string;
  duration?: number;   // hint in seconds
  autoPlay?: boolean;
  label?: string;
}

export function AudioMedia({ src, duration, autoPlay = false, label }: AudioMediaProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal]       = useState(duration ?? 0);
  const [loaded, setLoaded]     = useState(false);
  const [tick, setTick]         = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onMeta = () => { setTotal(el.duration || duration || 0); setLoaded(true); };
    const onTime = () => setProgress(el.currentTime);
    const onEnd  = () => { setPlaying(false); setProgress(0); };
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnd);
    if (autoPlay) { el.play().then(() => setPlaying(true)).catch(() => {}); }
    return () => {
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnd);
    };
  }, [src, autoPlay, duration]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(id);
  }, [playing]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const seekTo = (clientX: number, rect: DOMRect) => {
    const el = audioRef.current;
    if (!el || !total) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const target = ratio * total;
    if (isFinite(target)) el.currentTime = target;
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    seekTo(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const pct = total > 0 ? (progress / total) * 100 : 0;

  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background: 'linear-gradient(135deg, #FBF8EE 0%, #F4EED8 100%)',
        borderColor: '#C9A87A',
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      {label && (
        <p className="text-xs font-bold text-jawwib-text-dim mb-2 text-center">{label}</p>
      )}

      {/* Waveform decoration */}
      <div className="flex items-end justify-center gap-0.5 h-8 mb-3 opacity-60">
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-75"
            style={{
              width: '3px',
              height: `${6 + Math.abs(Math.sin(i * 1.1 + tick * 0.45)) * 18 + (playing ? 2 : 0)}px`,
              background: i / 24 < pct / 100 ? '#B07D1A' : '#C9A87A',
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full mb-3 cursor-pointer relative"
        style={{ background: '#E8DFC8' }}
        onClick={seek}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#B07D1A,#D4A94A)' }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-jawwib-text-dim tabular-nums">
          {fmt(progress)}
        </span>
        <button
          onClick={toggle}
          className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xl text-white shadow-md transition-all active:scale-95 tap-target"
          style={{ background: 'linear-gradient(135deg,#B07D1A,#D4A94A)' }}
          disabled={!loaded && !duration}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <span className="text-xs font-mono text-jawwib-text-dim tabular-nums">
          {total > 0 ? fmt(total) : '--:--'}
        </span>
      </div>
    </div>
  );
}

// ── Video ─────────────────────────────────────────────────────────────────────

interface VideoMediaProps {
  src: string;
  caption?: string;
  muted?: boolean;
}

export function VideoMedia({ src, caption, muted = false }: VideoMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  return (
    <>
      <div className="relative w-full rounded-2xl overflow-hidden border border-jawwib-border shadow-sm bg-black">
        <video
          ref={videoRef}
          src={src}
          muted={muted}
          playsInline
          className="w-full"
          style={{ maxHeight: '240px', objectFit: 'contain' }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
        {/* Play overlay */}
        {!playing && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.35)' }}
            onClick={toggle}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white shadow-2xl"
              style={{ background: 'rgba(176,125,26,0.85)' }}
            >
              ▶
            </div>
          </div>
        )}
        {/* Controls bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2"
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}
        >
          <button onClick={toggle} className="text-white text-sm font-bold tap-target">
            {playing ? '⏸ إيقاف' : '▶ تشغيل'}
          </button>
          <button
            onClick={() => { videoRef.current?.pause(); setPlaying(false); setFullscreen(true); }}
            className="text-white text-sm tap-target"
          >
            ⛶
          </button>
        </div>
      </div>
      {caption && <p className="text-center text-xs text-jawwib-text-dim mt-1">{caption}</p>}

      {/* Fullscreen */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <video
            src={src}
            muted={muted}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 text-white font-black text-lg"
            onClick={() => setFullscreen(false)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
