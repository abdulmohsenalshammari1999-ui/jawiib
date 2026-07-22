import type { Evidence } from '@/lib/types';
import { ImageMedia, AudioMedia, VideoMedia } from './MediaRenderer';

interface Props {
  evidence: Evidence;
}

export function EvidenceCard({ evidence }: Props) {
  return (
    <div
      className="animate-evidence-reveal rounded-2xl overflow-hidden mt-3"
      style={{
        background:  'linear-gradient(135deg, #FBF7EC 0%, #F8F1DC 100%)',
        border:      '1.5px solid rgba(176, 125, 26, 0.35)',
        boxShadow:   '0 2px 12px rgba(176, 125, 26, 0.10)',
      }}
    >
      {/* Gold shimmer top bar */}
      <div
        className="h-1"
        style={{
          background: 'linear-gradient(90deg, #B07D1A 0%, #D4A94A 40%, #B07D1A 70%, #8A6010 100%)',
        }}
      />

      <div className="px-4 pt-3.5 pb-4">
        {/* Label */}
        <p className="text-xs font-black tracking-wide mb-3 flex items-center gap-1" style={{ color: '#B07D1A' }}>
          <span>💡</span>
          <span>لماذا هذه الإجابة الصحيحة؟</span>
        </p>

        {/* Media (image / audio / video) */}
        {evidence.videoUrl && (
          <div className="mb-3">
            <VideoMedia src={evidence.videoUrl} caption={evidence.title} muted={false} />
          </div>
        )}
        {!evidence.videoUrl && evidence.audioUrl && (
          <div className="mb-3">
            <AudioMedia src={evidence.audioUrl} label={evidence.title} />
          </div>
        )}
        {!evidence.videoUrl && !evidence.audioUrl && evidence.imageUrl && (
          <div className="mb-3">
            <ImageMedia src={evidence.imageUrl} alt={evidence.title} />
          </div>
        )}

        <div className="flex gap-3 items-start">
          {/* Emoji anchor — shown only when no rich media */}
          {!evidence.imageUrl && !evidence.audioUrl && !evidence.videoUrl && evidence.visualIcon && (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: 'rgba(176, 125, 26, 0.08)', border: '1px solid rgba(176, 125, 26, 0.2)' }}
            >
              {evidence.visualIcon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Title — explicit dark brown so it reads on the parchment background */}
            <p className="text-sm font-black leading-snug mb-1.5" style={{ color: '#2D1A06' }}>
              {evidence.title}
            </p>

            {/* Description — readable dark text on cream */}
            <p className="text-sm leading-relaxed" style={{ color: '#4A2E0A', lineHeight: '1.65' }}>
              {evidence.description}
            </p>

            {/* Source link */}
            {evidence.sourceLink && (
              <a
                href={evidence.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-[10px] text-jawwib-gold underline underline-offset-2"
              >
                📎 المصدر
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
