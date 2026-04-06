import { useState } from 'react';
import { categories } from '@/lib/categories';
import type { CategoryId } from '@/lib/types';

interface LobbyProps {
  roomCode: string;
  players: { id: string; name: string; avatar: string; isHost: boolean }[];
  isTrial: boolean;
  selectedCategories: CategoryId[];
  onStartGame: () => void;
  onShowPayment: () => void;
  isHost: boolean;
  qrUrl: string;
}

export function Lobby({
  roomCode,
  players,
  isTrial,
  selectedCategories,
  onStartGame,
  onShowPayment,
  isHost,
  qrUrl,
}: LobbyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      {/* Room Code */}
      <div className="game-card p-6 text-center mb-4">
        <p className="text-jawwib-text-dim text-sm mb-2">كود الغرفة</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-bold tracking-[0.3em] text-gold-gradient">
            {roomCode}
          </span>
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded-lg bg-jawwib-surface border border-jawwib-border text-sm
              hover:border-jawwib-gold transition-all"
          >
            {copied ? '✓ تم' : '📋 نسخ'}
          </button>
        </div>
      </div>

      {/* QR Code */}
      <div className="game-card p-6 text-center mb-4">
        <p className="text-jawwib-text-dim text-sm mb-3">امسح الكود للدخول</p>
        <div className="inline-block bg-white p-3 rounded-xl">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl)}&bgcolor=FFFFFF&color=06060F`}
            alt="QR Code"
            width={180}
            height={180}
          />
        </div>
      </div>

      {/* Players */}
      <div className="game-card p-4 mb-4">
        <h3 className="text-jawwib-gold font-bold text-sm mb-3">
          اللاعبين ({players.length})
        </h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-jawwib-surface"
            >
              <span className="text-2xl">{player.avatar}</span>
              <span className="font-bold text-sm">{player.name}</span>
              {player.isHost && (
                <span className="text-xs bg-jawwib-gold/20 text-jawwib-gold px-2 py-0.5 rounded-full">
                  المضيف
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Game Mode Info */}
      {isTrial && (
        <div className="game-card p-4 mb-4 border-jawwib-gold/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-jawwib-gold font-bold text-sm">🔒 النسخة التجريبية</h3>
              <p className="text-jawwib-text-dim text-xs mt-1">
                9 أسئلة فقط • فئتين عشوائية • بدون تخريب
              </p>
            </div>
            <button
              onClick={onShowPayment}
              className="btn-gold text-sm px-4 py-2"
            >
              ترقية
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="game-card p-4 mb-4">
        <h3 className="text-jawwib-gold font-bold text-sm mb-3">الفئات المختارة</h3>
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((catId) => {
            const cat = categories.find((c) => c.id === catId);
            if (!cat) return null;
            return (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-jawwib-surface border border-jawwib-border text-xs font-bold"
              >
                {cat.icon} {cat.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Start button */}
      {isHost && (
        <button
          onClick={onStartGame}
          disabled={players.length < 1}
          className="btn-gold w-full text-lg py-4"
        >
          ابدأ اللعبة! 🎮
        </button>
      )}

      {!isHost && (
        <div className="text-center text-jawwib-text-dim text-sm p-4">
          ⏳ بانتظار المضيف لبدء اللعبة...
        </div>
      )}
    </div>
  );
}
