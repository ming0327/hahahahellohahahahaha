import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { generateDeck } from './data/cardsData';
import {
  playFlipSound,
  playMatchSound,
  playMismatchSound,
  playVictorySound,
} from './utils/sound';
import { saveScoreToLeaderboard } from './utils/leaderboard';
import LeaderboardModal from './components/LeaderboardModal';
import './App.css';

export default function App() {
  const [deck, setDeck] = useState(() => generateDeck());
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState(new Set());
  const [shakingIndices, setShakingIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 排行榜彈窗狀態與當局記錄 ID
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lastRecordId, setLastRecordId] = useState(null);

  // 最佳紀錄 (保留原有本地狀態)
  const [bestMoves, setBestMoves] = useState(() => {
    const saved = localStorage.getItem('memory_game_best_moves');
    return saved ? parseInt(saved, 10) : null;
  });
  const [bestTime, setBestTime] = useState(() => {
    const saved = localStorage.getItem('memory_game_best_time');
    return saved ? parseInt(saved, 10) : null;
  });

  const timerRef = useRef(null);

  // 計時器邏輯
  useEffect(() => {
    if (isTimerActive && !isCompleted) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, isCompleted]);

  // 時間格式化 (MM:SS)
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 即時計算當前答對率 (若步數為 0 則為 100%)
  const currentAccuracy =
    moves === 0 ? 100 : Math.round((matchedPairIds.size / moves) * 100);

  // 檢查是否通關
  useEffect(() => {
    if (matchedPairIds.size === 8 && !isCompleted) {
      setIsCompleted(true);
      setIsTimerActive(false);

      if (soundEnabled) {
        playVictorySound();
      }

      // 施放彩色紙花禮炮
      launchConfetti();

      // 計算最終答對率 (8 對成功 / 總步數)
      const finalAccuracy = Math.round((8 / Math.max(8, moves)) * 100);

      // 自動將成績寫入排行榜
      const recordId = saveScoreToLeaderboard({
        name: '玩家 #' + Math.floor(100 + Math.random() * 900),
        seconds,
        moves,
        accuracy: finalAccuracy,
      });
      setLastRecordId(recordId);

      // 更新紀錄
      if (bestMoves === null || moves < bestMoves) {
        setBestMoves(moves);
        localStorage.setItem('memory_game_best_moves', moves.toString());
      }
      if (bestTime === null || seconds < bestTime) {
        setBestTime(seconds);
        localStorage.setItem('memory_game_best_time', seconds.toString());
      }
    }
  }, [matchedPairIds, moves, seconds, soundEnabled, bestMoves, bestTime, isCompleted]);

  // 慶祝紙花特效
  const launchConfetti = () => {
    try {
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#6366f1', '#ec4899', '#38bdf8', '#fbbf24', '#10b981'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {
      // 容錯防護
    }
  };

  // 點擊翻牌
  const handleCardClick = (index) => {
    // 鎖定中、已翻開、已配對則無效
    if (
      isChecking ||
      flippedIndices.includes(index) ||
      matchedPairIds.has(deck[index].pairId)
    ) {
      return;
    }

    // 第一次翻牌時啟動計時
    if (!isTimerActive && !isCompleted) {
      setIsTimerActive(true);
    }

    if (soundEnabled) {
      playFlipSound();
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // 當翻開第二張牌時進行判定
    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsChecking(true);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = deck[firstIdx];
      const secondCard = deck[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // 配對成功！消除
        setTimeout(() => {
          if (soundEnabled) {
            playMatchSound();
          }
          setMatchedPairIds((prev) => {
            const next = new Set(prev);
            next.add(firstCard.pairId);
            return next;
          });
          setFlippedIndices([]);
          setIsChecking(false);
        }, 500);
      } else {
        // 配對失敗，短暫顯示後蓋回
        setTimeout(() => {
          if (soundEnabled) {
            playMismatchSound();
          }
          setShakingIndices([firstIdx, secondIdx]);
        }, 600);

        setTimeout(() => {
          setFlippedIndices([]);
          setShakingIndices([]);
          setIsChecking(false);
        }, 1100);
      }
    }
  };

  // 重新開始遊戲
  const handleRestart = () => {
    setDeck(generateDeck());
    setFlippedIndices([]);
    setMatchedPairIds(new Set());
    setShakingIndices([]);
    setMoves(0);
    setSeconds(0);
    setIsTimerActive(false);
    setIsChecking(false);
    setIsCompleted(false);
  };

  // 計算星級 (以步數為基準)
  const getRating = () => {
    if (moves <= 12) return 3;
    if (moves <= 18) return 2;
    return 1;
  };

  return (
    <div className="game-wrapper">
      {/* 頁首標題區 */}
      <header className="game-header">
        <div className="header-title-row">
          <h1 className="game-title">記憶翻牌大挑戰</h1>
        </div>
        <p className="game-subtitle">翻找相同的卡片將它們消除，考驗你的專注力！</p>
      </header>

      {/* 即時數據面板 */}
      <section className="stats-bar" aria-label="遊戲統計資訊">
        <div className="stat-card" id="stat-timer">
          <span className="stat-label">⏱️ 計時</span>
          <span className="stat-value">{formatTime(seconds)}</span>
        </div>

        <div className="stat-card" id="stat-moves">
          <span className="stat-label">🎯 步數</span>
          <span className="stat-value">{moves}</span>
        </div>

        <div className="stat-card" id="stat-accuracy">
          <span className="stat-label">📊 答對率</span>
          <span className="stat-value">{currentAccuracy}%</span>
        </div>

        <div className="stat-card" id="stat-progress">
          <span className="stat-label">✨ 進度</span>
          <span className="stat-value">{matchedPairIds.size} / 8</span>
        </div>

        <div className="stat-actions">
          <button
            type="button"
            className="icon-btn leaderboard-trigger-btn"
            id="open-leaderboard-btn"
            onClick={() => setShowLeaderboard(true)}
            title="查看速度與答對率排行榜"
            aria-label="查看排行榜"
          >
            🏆
          </button>
          <button
            type="button"
            className="icon-btn"
            id="toggle-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? '點擊靜音' : '點擊開啟音效'}
            aria-label="音效開關"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </section>

      {/* 4x4 卡牌網格區 */}
      <main className="board-container">
        <div className="cards-grid" role="grid" aria-label="卡牌對戰盤面">
          {deck.map((card, index) => {
            const isFlipped = flippedIndices.includes(index);
            const isMatched = matchedPairIds.has(card.pairId);
            const isShaking = shakingIndices.includes(index);

            return (
              <div
                key={card.id}
                className={`card-slot ${isChecking ? 'locked' : ''}`}
                onClick={() => handleCardClick(index)}
                role="button"
                tabIndex={isMatched ? -1 : 0}
                aria-label={`卡片 ${index + 1}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(index);
                  }
                }}
              >
                <div
                  className={`card-inner ${
                    isFlipped || isMatched ? 'is-flipped' : ''
                  } ${isMatched ? 'is-matched' : ''} ${
                    isShaking ? 'is-shaking' : ''
                  }`}
                >
                  {/* 背面（未翻開時） */}
                  <div className="card-front">
                    <div className="card-back-pattern">
                      <span className="card-pattern-icon">✦</span>
                    </div>
                  </div>

                  {/* 正面（翻開後） */}
                  <div
                    className="card-back"
                    style={{
                      border: isMatched
                        ? '2px solid rgba(16, 185, 129, 0.7)'
                        : `2px solid ${card.glowColor}`,
                      boxShadow: isFlipped
                        ? `0 0 16px ${card.glowColor}`
                        : undefined,
                    }}
                  >
                    <span className="card-icon">{card.icon}</span>
                    <span className="card-name">{card.name}</span>
                    {isMatched && <div className="matched-badge">✓</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 底部輔助列 */}
      <footer className="game-footer">
        <div className="best-score-display">
          <span>🏆 最佳紀錄:</span>
          {bestMoves !== null ? (
            <span className="best-score-badge">
              {bestMoves} 步 ({formatTime(bestTime || 0)})
            </span>
          ) : (
            <span style={{ opacity: 0.6 }}>尚未記錄</span>
          )}
        </div>

        <div className="footer-btns">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setShowLeaderboard(true)}
          >
            <span>🏆</span> 排行榜
          </button>
          <button
            type="button"
            className="reset-btn"
            id="btn-restart"
            onClick={handleRestart}
          >
            <span>🔄</span> 重新開始
          </button>
        </div>
      </footer>

      {/* 通關完成彈窗 (Modal) */}
      {isCompleted && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="win-modal">
            <div className="win-badge-icon">🎉</div>
            <h2 className="win-title">挑戰完成！</h2>
            <p className="win-subtitle">太棒了！成績已自動登錄至榮譽排行榜</p>

            <div className="star-rating" title={`${getRating()} 顆星評分`}>
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= getRating() ? 'filled' : 'empty'}`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="win-stats-grid win-stats-four">
              <div className="win-stat-box">
                <div className="win-stat-title">⚡ 總耗時</div>
                <div className="win-stat-number">{formatTime(seconds)}</div>
              </div>
              <div className="win-stat-box">
                <div className="win-stat-title">🎯 答對率</div>
                <div className="win-stat-number text-accent">
                  {Math.round((8 / Math.max(8, moves)) * 100)}%
                </div>
              </div>
              <div className="win-stat-box">
                <div className="win-stat-title">👣 總步數</div>
                <div className="win-stat-number">{moves} 步</div>
              </div>
              <div className="win-stat-box">
                <div className="win-stat-title">🚀 平均速度</div>
                <div className="win-stat-number">
                  {(seconds / 8).toFixed(1)}s/對
                </div>
              </div>
            </div>

            <div className="win-modal-actions">
              <button
                type="button"
                className="win-btn-secondary"
                id="modal-leaderboard-btn"
                onClick={() => setShowLeaderboard(true)}
              >
                <span>🏆</span> 查看排行榜
              </button>
              <button
                type="button"
                className="win-btn-primary"
                id="modal-restart-btn"
                onClick={handleRestart}
              >
                <span>🚀</span> 再玩一次
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 獨立排行榜彈窗組件 */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        formatTime={formatTime}
        currentRecordId={lastRecordId}
      />
    </div>
  );
}
