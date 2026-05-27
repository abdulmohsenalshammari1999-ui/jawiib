import type { Evidence } from '@/lib/types';

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

      <div className="px-3.5 pt-3 pb-3.5">
        {/* Label */}
        <p className="text-[10px] font-black tracking-wider text-jawwib-gold uppercase mb-2 flex items-center gap-1">
          <span>💡</span>
          <span>لماذا هذه الإجابة الصحيحة؟</span>
        </p>

        <div className="flex gap-3 items-start">
          {/* Visual anchor — image takes priority over emoji */}
          {evidence.imageUrl ? (
            <img
              src={evidence.imageUrl}
              alt={evidence.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm"
            />
          ) : evidence.visualIcon ? (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl shrink-0"
              style={{ background: 'rgba(176, 125, 26, 0.08)', border: '1px solid rgba(176, 125, 26, 0.2)' }}
            >
              {evidence.visualIcon}
            </div>
          ) : null}

          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className="text-sm font-black text-jawwib-text leading-snug mb-1">
              {evidence.title}
            </p>

            {/* Description — 4 line clamp for mobile */}
            <p
              className="text-[11.5px] leading-relaxed text-jawwib-text/75"
              style={{
                display:           '-webkit-box',
                WebkitLineClamp:   4,
                WebkitBoxOrient:   'vertical',
                overflow:          'hidden',
              }}
            >
              {evidence.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
