import { useState } from 'react';
import {
  getLeaderboard,
  getSpeedRankings,
  getAccuracyRankings,
  resetLeaderboard,
} from '../utils/leaderboard';

export default function LeaderboardModal({
  isOpen,
  onClose,
  formatTime,
  currentRecordId,
}) {
  const [activeTab, setActiveTab] = useState('speed'); // 'speed' | 'accuracy'
  const [records, setRecords] = useState(() => getLeaderboard());

  if (!isOpen) return null;

  const speedList = getSpeedRankings(records).slice(0, 10);
  const accuracyList = getAccuracyRankings(records).slice(0, 10);
  const displayList = activeTab === 'speed' ? speedList : accuracyList;

  const handleReset = () => {
    if (window.confirm('確定要將排行榜恢復為預設紀錄嗎？')) {
      const reset = resetLeaderboard();
      setRecords([...reset]);
    }
  };

  const getRankBadge = (index) => {
    if (index === 0) return <span className="rank-medal gold">🥇 1</span>;
    if (index === 1) return <span className="rank-medal silver">🥈 2</span>;
    if (index === 2) return <span className="rank-medal bronze">🥉 3</span>;
    return <span className="rank-medal normal">#{index + 1}</span>;
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="leaderboard-modal">
        {/* 頂部標題與關閉按鈕 */}
        <div className="modal-top-bar">
          <div className="leaderboard-title-group">
            <span className="leaderboard-icon">🏆</span>
            <h2 className="leaderboard-heading">榮譽排行榜</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="關閉排行榜"
          >
            ✕
          </button>
        </div>

        {/* 分頁切換按鈕：速度 vs 答對率 */}
        <div className="tab-switcher" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'speed'}
            className={`tab-btn ${activeTab === 'speed' ? 'active' : ''}`}
            onClick={() => setActiveTab('speed')}
          >
            <span>⚡ 最快速度榜</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'accuracy'}
            className={`tab-btn ${activeTab === 'accuracy' ? 'active' : ''}`}
            onClick={() => setActiveTab('accuracy')}
          >
            <span>🎯 最高答對率榜</span>
          </button>
        </div>

        {/* 排行榜資訊說明 */}
        <div className="leaderboard-hint">
          {activeTab === 'speed' ? (
            <span>🚀 依通關耗時由快至慢排序（同秒數比答對率）</span>
          ) : (
            <span>🎯 依配對命中率由高至低排序（同命中率比通關速度）</span>
          )}
        </div>

        {/* 排行榜清單 */}
        <div className="leaderboard-list">
          <div className="leaderboard-table-header">
            <span className="col-rank">排名</span>
            <span className="col-player">挑戰者</span>
            <span className="col-time">耗時</span>
            <span className="col-acc">答對率</span>
            <span className="col-moves">步數</span>
          </div>

          {displayList.length === 0 ? (
            <div className="empty-leaderboard">目前暫無紀錄</div>
          ) : (
            displayList.map((item, index) => {
              const isCurrent = item.id === currentRecordId;
              return (
                <div
                  key={item.id}
                  className={`leaderboard-row ${isCurrent ? 'highlight-row' : ''} ${
                    index < 3 ? 'top-three' : ''
                  }`}
                >
                  <div className="col-rank">{getRankBadge(index)}</div>
                  <div className="col-player">
                    <span className="player-name">{item.name}</span>
                    {isCurrent && <span className="new-tag">本次紀錄</span>}
                  </div>
                  <div className="col-time font-mono">
                    {formatTime(item.seconds)}
                  </div>
                  <div className="col-acc font-mono">
                    <span
                      className={`acc-pill ${
                        item.accuracy >= 80
                          ? 'acc-high'
                          : item.accuracy >= 60
                          ? 'acc-mid'
                          : 'acc-low'
                      }`}
                    >
                      {item.accuracy}%
                    </span>
                  </div>
                  <div className="col-moves font-mono">{item.moves} 步</div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部功能列 */}
        <div className="leaderboard-footer">
          <button
            type="button"
            className="text-subtle-btn"
            onClick={handleReset}
            title="重設為預設排行榜"
          >
            🔄 重設紀錄
          </button>
          <button type="button" className="action-btn-back" onClick={onClose}>
            返回遊戲
          </button>
        </div>
      </div>
    </div>
  );
}
