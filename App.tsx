
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus } from './types';

const INITIAL_TIME = 10.0;
const MAX_ATTEMPTS = 10;

interface AttemptRecord {
  id: number;
  timeRemaining: number;
  points: number;
}

interface FloatingPoint {
  id: number;
  value: number;
  x: number;
  y: number;
  isBonus98: boolean;
  isBonus99: boolean;
}

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [screenFlash, setScreenFlash] = useState<'none' | 'bonus' | 'perfect'>('none');
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calculatePointsDetail = (currentTime: number) => {
    const elapsedTime = INITIAL_TIME - currentTime;
    const percentageElapsed = (elapsedTime / INITIAL_TIME) * 100;
    
    let basePoints = 0;
    let bonus98 = 0;
    let bonus99 = 0;

    if (percentageElapsed >= 80) {
      basePoints = Math.round(5 * (percentageElapsed - 80));
      if (percentageElapsed >= 98) bonus98 = 50;
      if (percentageElapsed >= 99) bonus99 = 100;
    }
    
    return {
      total: basePoints + bonus98 + bonus99,
      isBonus98: percentageElapsed >= 98 && percentageElapsed < 99,
      isBonus99: percentageElapsed >= 99
    };
  };

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          stopTimer();
          setStatus(GameStatus.LOST);
          return 0;
        }
        return parseFloat((prev - 0.1).toFixed(1));
      });
    }, 100);
  }, [stopTimer]);

  const handleButtonClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (status === GameStatus.LOST || (status === GameStatus.PLAYING && attempts >= MAX_ATTEMPTS)) return;

    setIsResetting(true);
    setTimeout(() => setIsResetting(false), 150);

    const x = 'clientX' in e ? (e as React.MouseEvent).clientX : (e as React.TouchEvent).touches[0].clientX;
    const y = 'clientY' in e ? (e as React.MouseEvent).clientY : (e as React.TouchEvent).touches[0].clientY;

    if (status === GameStatus.IDLE) {
      setStatus(GameStatus.PLAYING);
      setScore(0);
      setAttempts(0);
      setHistory([]);
      setTimeLeft(INITIAL_TIME);
      startTimer();
      return;
    }

    const { total, isBonus98, isBonus99 } = calculatePointsDetail(timeLeft);
    const timeAtClick = timeLeft;
    const nextAttempt = attempts + 1;

    // Retours visuels spécifiques aux bonus
    if (isBonus99) {
      setScreenFlash('perfect');
      setTimeout(() => setScreenFlash('none'), 300);
    } else if (isBonus98) {
      setScreenFlash('bonus');
      setTimeout(() => setScreenFlash('none'), 200);
    }

    if (total > 0) {
      const id = Date.now();
      setFloatingPoints(prev => [...prev, { id, value: total, x, y, isBonus98, isBonus99 }]);
      setTimeout(() => setFloatingPoints(prev => prev.filter(p => p.id !== id)), 1000);
    }

    const newRecord: AttemptRecord = {
      id: Date.now(),
      timeRemaining: timeAtClick,
      points: total
    };

    setScore(s => s + total);
    setAttempts(nextAttempt);
    setHistory(prev => [...prev, newRecord]);
    
    if (nextAttempt >= MAX_ATTEMPTS) {
      stopTimer();
      setStatus(GameStatus.LOST);
    } else {
      setTimeLeft(INITIAL_TIME);
      startTimer();
    }
  };

  const resetGame = () => {
    stopTimer();
    setStatus(GameStatus.IDLE);
    setTimeLeft(INITIAL_TIME);
    setScore(0);
    setAttempts(0);
    setHistory([]);
    setFloatingPoints([]);
    setScreenFlash('none');
  };

  useEffect(() => {
    if (status === GameStatus.LOST && score > highScore) {
      setHighScore(score);
    }
  }, [status, score, highScore]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const percentageElapsed = ((INITIAL_TIME - timeLeft) / INITIAL_TIME) * 100;
  
  const getTimerColor = () => {
    if (status === GameStatus.LOST) return 'text-slate-700';
    if (percentageElapsed < 80) return 'text-emerald-400';
    if (percentageElapsed < 98) return 'text-cyan-400';
    return 'text-red-500 animate-pulse';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 select-none touch-none bg-slate-950 text-white transition-colors duration-200 ${screenFlash === 'bonus' ? 'bg-orange-900/20' : screenFlash === 'perfect' ? 'bg-red-900/30' : ''}`}>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(2,6,23,1)_100%)]" />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full transition-opacity duration-1000 ${status === GameStatus.PLAYING ? 'opacity-100' : 'opacity-30'}`} />

      {/* Floating Points */}
      {floatingPoints.map(p => (
        <div key={p.id} className="absolute z-50 pointer-events-none flex flex-col items-center animate-[fadeOutUp_1s_ease-out_forwards]" style={{ left: p.x, top: p.y - 40 }}>
          {p.isBonus99 && <span className="text-red-500 font-black text-xs uppercase tracking-[0.2em] mb-1 animate-bounce shadow-red-500 drop-shadow-md">PERFECT!</span>}
          {p.isBonus98 && <span className="text-orange-400 font-black text-xs uppercase tracking-[0.2em] mb-1">PRECISION!</span>}
          <span className={`font-black text-3xl md:text-4xl drop-shadow-lg ${p.isBonus99 ? 'text-red-500 scale-125' : p.isBonus98 ? 'text-orange-400 scale-110' : 'text-white'}`}>
            +{p.value}
          </span>
        </div>
      ))}

      {/* Header Info */}
      <div className="absolute top-8 left-0 w-full px-8 flex justify-between items-start max-w-5xl mx-auto left-1/2 -translate-x-1/2">
        <div className="flex flex-col">
          <span className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">Score Cumulé</span>
          <span className="text-5xl font-black text-white tabular-nums tracking-tighter drop-shadow-lg">{score}</span>
        </div>
        
        {status === GameStatus.PLAYING && (
          <div className="flex flex-col items-center">
            <span className="text-emerald-400 text-[10px] uppercase tracking-[0.3em] font-black">Essais</span>
            <div className="flex items-end space-x-1">
              <span className="text-3xl font-black text-white">{attempts}</span>
              <span className="text-slate-500 text-lg font-bold mb-1">/ {MAX_ATTEMPTS}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col items-end">
          <span className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">Record</span>
          <span className="text-5xl font-black text-emerald-400 tabular-nums tracking-tighter drop-shadow-lg">{highScore}</span>
        </div>
      </div>

      {/* Main UI */}
      <div className="flex flex-col items-center space-y-8 z-10 w-full max-w-2xl">
        
        {status === GameStatus.LOST ? (
          <div className="flex flex-col items-center space-y-6 w-full animate-in fade-in zoom-in duration-500">
            <div className="text-center">
              <div className={`text-xs font-black tracking-[0.4em] uppercase mb-1 ${timeLeft === 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                {timeLeft === 0 ? 'Temps Épuisé' : 'Session Terminée'}
              </div>
              <h2 className={`text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none ${timeLeft === 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                {timeLeft === 0 ? 'PERDU' : 'SCORE FINAL'}
              </h2>
              <p className="text-slate-400 mt-2 text-2xl font-bold">{score} <span className="text-sm font-normal uppercase tracking-widest ml-1">Points</span></p>
            </div>

            <div className="w-full bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 max-h-[45vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Historique des {history.length} essais</h3>
                <span className="text-slate-500 text-[10px] font-bold">TEMPS / POINTS</span>
              </div>
              <div className="space-y-2">
                {history.map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 text-xs font-black">#{index + 1}</span>
                      <div className="flex flex-col">
                        <span className="text-white font-mono text-sm">{record.timeRemaining.toFixed(1)}s restantes</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Précision</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-lg font-black ${record.points >= 200 ? 'text-red-500 animate-pulse shadow-red-500/20 drop-shadow-md' : record.points >= 150 ? 'text-orange-400' : record.points >= 100 ? 'text-cyan-400' : 'text-slate-600'}`}>
                        +{record.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={resetGame} className="group px-12 py-5 bg-white text-black font-extrabold rounded-2xl hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center space-x-3">
              <i className="fa-solid fa-rotate-right group-hover:rotate-180 transition-transform duration-500"></i>
              <span className="tracking-tight">RÉESSAYER</span>
            </button>
          </div>
        ) : (
          <>
            {/* Timer Visual */}
            <div className="flex flex-col items-center">
              <div className={`timer-font text-8xl md:text-9xl font-bold tabular-nums transition-all duration-200 ${getTimerColor()} ${isResetting ? 'scale-110' : 'scale-100'}`}>
                {timeLeft.toFixed(1)}<span className="text-3xl md:text-4xl opacity-50 ml-1">s</span>
              </div>
              
              <div className="relative w-72 h-3 bg-slate-800/50 rounded-full mt-6 backdrop-blur-sm border border-white/5 overflow-hidden">
                 <div className="absolute left-[20%] top-0 h-full w-0.5 bg-white/20 z-10" />
                 <div className="absolute left-[2%] top-0 h-full w-0.5 bg-orange-500/40 z-10" />
                 <div className="absolute left-[1%] top-0 h-full w-0.5 bg-red-500/60 z-10" />
                 
                 <div 
                   className={`h-full transition-all duration-100 ease-linear rounded-full 
                     ${percentageElapsed < 80 ? 'bg-emerald-500' : percentageElapsed < 98 ? 'bg-cyan-400' : 'bg-red-500'}`}
                   style={{ width: `${(timeLeft / INITIAL_TIME) * 100}%` }}
                 />
              </div>
            </div>

            {/* Central Button */}
            <div className="relative">
              <button
                onMouseDown={handleButtonClick}
                onTouchStart={(e) => { e.preventDefault(); handleButtonClick(e); }}
                className={`
                  w-52 h-52 md:w-72 md:h-72 rounded-full border-[14px] 
                  flex flex-col items-center justify-center
                  transition-all duration-150 transform active:scale-95
                  ${status === GameStatus.IDLE 
                    ? 'bg-emerald-600 border-emerald-400/30 hover:bg-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.2)]' 
                    : isResetting 
                      ? 'bg-cyan-400 border-white text-white scale-105'
                      : percentageElapsed >= 98 
                        ? 'bg-red-600 border-red-400 text-white shadow-[0_0_80px_rgba(220,38,38,0.4)]'
                        : percentageElapsed >= 80
                          ? 'bg-cyan-500 border-cyan-300 text-white shadow-[0_0_60px_rgba(6,182,212,0.3)]'
                          : 'bg-white border-slate-200/20 text-slate-900 shadow-[0_30px_60px_rgba(255,255,255,0.15)]'
                  }
                `}
              >
                {status === GameStatus.IDLE ? (
                  <>
                    <i className="fa-solid fa-play text-5xl mb-3 animate-pulse text-white"></i>
                    <span className="font-black text-2xl tracking-tight uppercase text-white">Lancer</span>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className={`font-black text-4xl md:text-6xl uppercase italic tracking-tighter transition-transform ${isResetting ? 'scale-110' : ''}`}>
                      RESET
                    </span>
                    <div className={`mt-2 flex flex-col items-center transition-all duration-200 ${percentageElapsed >= 80 ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'}`}>
                      <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">Potentiel :</span>
                      <span className={`text-3xl md:text-4xl font-black tabular-nums ${percentageElapsed >= 99 ? 'animate-bounce text-yellow-400' : ''}`}>
                        +{calculatePointsDetail(timeLeft).total}
                      </span>
                    </div>
                  </div>
                )}
              </button>
              {status === GameStatus.PLAYING && (
                <div className="absolute -inset-8 border-2 border-dashed border-white/10 rounded-full animate-[spin_30s_linear_infinite] -z-10" />
              )}
            </div>

            {/* Hint */}
            {status === GameStatus.IDLE && (
              <div className="bg-white/5 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 text-center text-slate-400 text-[11px] leading-relaxed max-w-sm shadow-2xl">
                Appuyez sur <span className="text-white font-bold">Lancer</span> pour démarrer.<br/>
                <span className="text-white font-bold">10 essais</span> pour maximiser le score.<br/>
                Bonus <span className="text-orange-400 font-bold">+50</span> à <span className="text-orange-400 font-bold">98% (0.2s)</span>.<br/>
                Bonus <span className="text-red-500 font-bold">+100</span> à <span className="text-red-500 font-bold">99% (0.1s)</span> !
              </div>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeOutUp {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          20% { opacity: 1; transform: translateY(-20px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-60px) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />

      <footer className="absolute bottom-8 text-slate-600 flex items-center space-x-2 text-[10px] tracking-[0.4em] uppercase font-black">
        <i className="fa-solid fa-bolt-lightning text-yellow-500/30"></i>
        <span>10s Precision Challenge</span>
      </footer>
    </div>
  );
};

export default App;
