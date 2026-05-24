import { useEffect, useState } from 'react';

interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
}

interface TeamAssignScreenProps {
  players: Array<Player>;
  localPlayerId: string;
  isHost: boolean;
  onAssign: (playerId: string, teamId: 'alpha' | 'beta') => void;
  onAutoAssign: () => void;
  onConfirm: () => void;
  alphaPlayerIds: string[];
  betaPlayerIds: string[];
}

function PlayerCard({
  player,
  isLocal,
  teamId,
  canAssign,
  onAssign,
  animIndex,
}: {
  player: Player;
  isLocal: boolean;
  teamId: 'alpha' | 'beta' | null;
  canAssign: boolean;
  onAssign: (teamId: 'alpha' | 'beta') => void;
  animIndex: number;
}) {
  const borderColor =
    teamId === 'alpha'
      ? 'border-blue-500/60'
      : teamId === 'beta'
        ? 'border-red-500/60'
        : 'border-jawwib-border';

  const avatarGlow =
    teamId === 'alpha'
      ? 'shadow-[0_0_10px_rgba(59,130,246,0.4)]'
      : teamId === 'beta'
        ? 'shadow-[0_0_10px_rgba(239,68,68,0.4)]'
        : '';

  return (
    <div
      className="animate-slide-up game-card p-3 flex flex-col items-center gap-2 relative min-w-[80px]"
      style={{ animationDelay: `${animIndex * 60}ms` }}
    >
      {isLocal && (
        <span className="absolute top-1.5 right-1.5 text-[10px] bg-jawwib-gold/20 text-jawwib-gold px-1.5 py-0.5 rounded-full font-black leading-none">
          أنت
        </span>
      )}
      {player.isHost && (
        <span className="absolute top-1.5 left-1.5 text-[10px] bg-jawwib-purple/20 text-jawwib-purple px-1.5 py-0.5 rounded-full font-bold leading-none">
          مضيف
        </span>
      )}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-jawwib-surface border-2 ${borderColor} ${avatarGlow} transition-all duration-300`}
      >
        {player.avatar}
      </div>
      <p className="text-xs font-bold text-jawwib-text text-center truncate w-full">
        {player.name}
      </p>
      {canAssign && (
        <div className="flex gap-1 w-full">
          <button
            onClick={() => onAssign('alpha')}
            title="الفريق الأزرق"
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all border ${
              teamId === 'alpha'
                ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                : 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10'
            }`}
          >
            🛡️
          </button>
          <button
            onClick={() => onAssign('beta')}
            title="الفريق الأحمر"
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all border ${
              teamId === 'beta'
                ? 'bg-red-500 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                : 'border-red-500/40 text-red-400 hover:bg-red-500/10'
            }`}
          >
            ⚔️
          </button>
        </div>
      )}
    </div>
  );
}

function TeamColumn({
  teamId,
  players,
  localPlayerId,
  canAssign,
  onAssign,
}: {
  teamId: 'alpha' | 'beta';
  players: Player[];
  localPlayerId: string;
  canAssign: (player: Player) => boolean;
  onAssign: (playerId: string, t: 'alpha' | 'beta') => void;
}) {
  const isAlpha = teamId === 'alpha';
  const headerBg = isAlpha ? 'bg-blue-500/10' : 'bg-red-500/10';
  const headerBorder = isAlpha ? 'border-blue-500/40' : 'border-red-500/40';
  const headerText = isAlpha ? 'text-blue-400' : 'text-red-400';
  const dividerColor = isAlpha ? 'border-blue-500/20' : 'border-red-500/20';
  const glowClass = isAlpha
    ? 'shadow-[0_0_24px_rgba(59,130,246,0.12)]'
    : 'shadow-[0_0_24px_rgba(239,68,68,0.12)]';
  const scoreGlow = isAlpha
    ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]'
    : 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]';

  return (
    <div
      className={`flex-1 rounded-2xl border-2 ${headerBorder} ${headerBg} ${glowClass} p-3 flex flex-col gap-3 min-h-[280px] transition-all duration-300`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between pb-2 border-b ${dividerColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isAlpha ? '🛡️' : '⚔️'}</span>
          <div>
            <p className={`font-black text-sm ${headerText}`}>
              {isAlpha ? 'الفريق الأزرق' : 'الفريق الأحمر'}
            </p>
            <p className="text-[10px] text-jawwib-text-dim">{players.length} لاعب</p>
          </div>
        </div>
        {/* Score badge */}
        <div className="text-center">
          <span className={`text-xl font-black ${scoreGlow}`}>0</span>
          <p className="text-[10px] text-jawwib-text-dim leading-none">نقطة</p>
        </div>
      </div>

      {/* Players list */}
      <div className="flex flex-col gap-2 flex-1">
        {players.length === 0 && (
          <div
            className={`flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed ${headerBorder} opacity-30 py-6 gap-2`}
          >
            <span className="text-2xl opacity-50">{isAlpha ? '🛡️' : '⚔️'}</span>
            <p className={`text-xs ${headerText}`}>لا يوجد لاعبين</p>
          </div>
        )}
        {players.map((player, i) => (
          <div
            key={player.id}
            className="animate-slide-up flex items-center gap-2 p-2 rounded-xl bg-jawwib-surface/60 border border-jawwib-border/40"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-xl shrink-0">{player.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-jawwib-text truncate">{player.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {player.id === localPlayerId && (
                  <span className="text-[9px] bg-jawwib-gold/20 text-jawwib-gold px-1 py-0.5 rounded-full font-bold">
                    أنت
                  </span>
                )}
                {player.isHost && (
                  <span className="text-[9px] text-jawwib-purple opacity-70">مضيف</span>
                )}
              </div>
            </div>
            {canAssign(player) && (
              <button
                onClick={() => onAssign(player.id, isAlpha ? 'beta' : 'alpha')}
                title={isAlpha ? 'نقل للأحمر' : 'نقل للأزرق'}
                className={`text-[10px] px-2 py-1 rounded-lg border shrink-0 transition-all ${
                  isAlpha
                    ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                    : 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10'
                }`}
              >
                {isAlpha ? '⚔️' : '🛡️'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamAssignScreen({
  players,
  localPlayerId,
  isHost,
  onAssign,
  onAutoAssign,
  onConfirm,
  alphaPlayerIds,
  betaPlayerIds,
}: TeamAssignScreenProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const assignedIds = new Set([...alphaPlayerIds, ...betaPlayerIds]);
  const unassigned = players.filter((p) => !assignedIds.has(p.id));
  const alphaPlayers = alphaPlayerIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];
  const betaPlayers = betaPlayerIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const canConfirm = alphaPlayerIds.length >= 1 && betaPlayerIds.length >= 1;

  const localTeamId: 'alpha' | 'beta' | null = alphaPlayerIds.includes(localPlayerId)
    ? 'alpha'
    : betaPlayerIds.includes(localPlayerId)
      ? 'beta'
      : null;

  function canAssignPlayer(player: Player): boolean {
    if (isHost) return true;
    if (player.id === localPlayerId) return true;
    return false;
  }

  if (!mounted) return null;

  return (
    <div className="animate-fade-in min-h-screen p-4 flex flex-col" dir="rtl">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-4 flex-1">

        {/* Title */}
        <div className="text-center animate-slide-up">
          <h1 className="text-3xl font-black text-gold-gradient mb-1">توزيع الفرق</h1>
          <p className="text-jawwib-text-dim text-sm">
            {isHost
              ? 'وزّع اللاعبين على الفريقين ثم اضغط تأكيد'
              : 'اختر فريقك أو انتظر المضيف'}
          </p>
        </div>

        {/* Unassigned pool */}
        {unassigned.length > 0 && (
          <div className="animate-slide-up game-card p-4" style={{ animationDelay: '80ms' }}>
            <p className="text-xs text-jawwib-text-dim mb-3 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-jawwib-gold animate-pulse inline-block" />
              لاعبين بدون فريق ({unassigned.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {unassigned.map((player, i) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isLocal={player.id === localPlayerId}
                  teamId={null}
                  canAssign={canAssignPlayer(player)}
                  onAssign={(t) => onAssign(player.id, t)}
                  animIndex={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Team columns */}
        <div className="flex gap-3 flex-1" style={{ animationDelay: '120ms' }}>
          <TeamColumn
            teamId="alpha"
            players={alphaPlayers}
            localPlayerId={localPlayerId}
            canAssign={canAssignPlayer}
            onAssign={onAssign}
          />
          <TeamColumn
            teamId="beta"
            players={betaPlayers}
            localPlayerId={localPlayerId}
            canAssign={canAssignPlayer}
            onAssign={onAssign}
          />
        </div>

        {/* Non-host self-assign prompt */}
        {!isHost && localTeamId === null && (
          <div className="animate-bounce-in game-card p-4 border-jawwib-gold/30 text-center">
            <p className="text-sm text-jawwib-gold font-bold mb-3">اختر فريقك:</p>
            <div className="flex gap-3">
              <button
                onClick={() => onAssign(localPlayerId, 'alpha')}
                className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-blue-500/60 text-blue-400 hover:bg-blue-500/10 hover:shadow-[0_0_14px_rgba(59,130,246,0.3)] transition-all"
              >
                🛡️ الفريق الأزرق
              </button>
              <button
                onClick={() => onAssign(localPlayerId, 'beta')}
                className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-red-500/60 text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_14px_rgba(239,68,68,0.3)] transition-all"
              >
                ⚔️ الفريق الأحمر
              </button>
            </div>
          </div>
        )}

        {/* Host actions */}
        {isHost && (
          <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <button
              onClick={onAutoAssign}
              className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
            >
              🎲 توزيع تلقائي
            </button>
            <button
              onClick={onConfirm}
              disabled={!canConfirm}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                canConfirm
                  ? 'btn-gold animate-pulse-gold'
                  : 'bg-jawwib-surface border-2 border-jawwib-border text-jawwib-text-dim opacity-40 cursor-not-allowed'
              }`}
            >
              ✅ تأكيد الفرق
            </button>
          </div>
        )}

        {!isHost && (
          <div className="text-center text-jawwib-text-dim text-sm py-2 animate-fade-in">
            {localTeamId !== null ? (
              <span>
                ✅ أنت في{' '}
                <span className={localTeamId === 'alpha' ? 'text-blue-400 font-bold' : 'text-red-400 font-bold'}>
                  {localTeamId === 'alpha' ? 'الفريق الأزرق 🛡️' : 'الفريق الأحمر ⚔️'}
                </span>
                {' '}— بانتظار المضيف...
              </span>
            ) : (
              '⏳ بانتظار المضيف لتأكيد الفرق...'
            )}
          </div>
        )}
      </div>
    </div>
  );
}
