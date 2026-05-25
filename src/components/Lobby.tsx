import { useState } from 'react';
import { categories } from '@/lib/categories';
import type { CategoryId } from '@/lib/types';

interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
}

interface LobbyProps {
  roomCode: string;
  players: Player[];
  isTrial: boolean;
  selectedCategories: CategoryId[];
  onStartGame: () => void;
  onShowPayment: () => void;
  onShowTeams?: () => void;
  onShowDraft?: () => void;
  isHost: boolean;
  qrUrl: string;
  mode?: 'ffa' | 'teams';
}

export function Lobby({
  roomCode,
  players,
  isTrial,
  selectedCategories,
  onStartGame,
  onShowPayment,
  onShowTeams,
  onShowDraft,
  isHost,
  qrUrl,
  mode = 'ffa',
}: LobbyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch {
      // fallback: select the text
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto space-y-4">
      {/* Room Code */}
      <div className="game-card p-5 text-center">
        <p className="text-jawwib-text-dim text-xs mb-2">شارك الكود مع أصدقائك</p>
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-3xl font-black tracking-[0.25em] text-gold-gradient">{roomCode}</span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-jawwib-surface border border-jawwib-border text-xs hover:border-jawwib-gold transition-all"
          >
            {copied ? '✓ تم' : '📋'}
          </button>
        </div>
        {/* QR */}
        <div className="flex justify-center">
          <div className="bg-white p-2 rounded-xl inline-block">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrUrl)}&bgcolor=FFFFFF&color=06060F`}
              alt="QR"
              width={140}
              height={140}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="game-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-jawwib-gold font-bold text-sm">اللاعبين ({players.length})</h3>
          {mode === 'teams' && isHost && onShowTeams && players.length >= 2 && (
            <button
              onClick={onShowTeams}
              className="text-xs px-3 py-1 rounded-lg bg-jawwib-blue/20 text-jawwib-blue border border-jawwib-blue/30 hover:bg-jawwib-blue/30 transition-all"
            >
              توزيع الفرق →
            </button>
          )}
        </div>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-jawwib-surface"
            >
              <span className="text-xl">{player.avatar}</span>
              <span className="font-bold text-sm flex-1">{player.name}</span>
              {player.isHost && (
                <span className="text-xs bg-jawwib-gold/20 text-jawwib-gold px-2 py-0.5 rounded-full">
                  مضيف
                </span>
              )}
            </div>
          ))}
          {players.length < 2 && (
            <p className="text-center text-jawwib-text-dim text-xs py-2">
              ⏳ بانتظار لاعب ثانٍ...
            </p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="game-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-jawwib-gold font-bold text-sm">الفئات ({selectedCategories.length})</h3>
          {!isTrial && isHost && onShowDraft && (
            <button
              onClick={onShowDraft}
              className="text-xs px-3 py-1 rounded-lg bg-jawwib-purple/20 text-jawwib-purple border border-jawwib-purple/30 hover:bg-jawwib-purple/30 transition-all"
            >
              Draft الفئات →
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {selectedCategories.map((catId) => {
            const cat = categories.find((c) => c.id === catId);
            if (!cat) return null;
            return (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-jawwib-surface border border-jawwib-border text-xs font-bold"
              >
                {cat.icon} {cat.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Trial upgrade */}
      {isTrial && (
        <div className="game-card p-4 border-jawwib-gold/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-jawwib-gold font-bold text-sm">🔒 وضع تجريبي</p>
              <p className="text-jawwib-text-dim text-xs mt-0.5">9 أسئلة • فئتين • بدون تخريب</p>
            </div>
            <button onClick={onShowPayment} className="btn-gold text-xs px-4 py-2">
              ترقية
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {isHost ? (
        <div className="space-y-2">
          <button
            onClick={onStartGame}
            disabled={players.length < 1}
            className="btn-gold w-full text-lg py-4"
          >
            ابدأ اللعبة! 🎮
          </button>
        </div>
      ) : (
        <div className="text-center text-jawwib-text-dim text-sm p-4">
          ⏳ بانتظار المضيف لبدء اللعبة...
        </div>
      )}
    </div>
  );
}
