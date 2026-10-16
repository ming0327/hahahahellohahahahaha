const STORAGE_KEY = 'memory_game_leaderboard_records';

// 初始示範排行榜數據（當玩家還沒破關時提供挑戰目標）
const INITIAL_LEADERBOARD = [
  {
    id: 'seed-1',
    name: '⚡ 閃電記憶手',
    seconds: 16,
    moves: 8,
    accuracy: 100,
    date: '2026/10/16',
    isDefault: true,
  },
  {
    id: 'seed-2',
    name: '🧠 神腦觀察家',
    seconds: 22,
    moves: 9,
    accuracy: 89,
    date: '2026/10/16',
    isDefault: true,
  },
  {
    id: 'seed-3',
    name: '🌟 幸運星玩家',
    seconds: 28,
    moves: 10,
    accuracy: 80,
    date: '2026/10/16',
    isDefault: true,
  },
  {
    id: 'seed-4',
    name: '🐾 萌新翻牌俠',
    seconds: 35,
    moves: 12,
    accuracy: 67,
    date: '2026/10/16',
    isDefault: true,
  },
];

// 讀取排行榜
export function getLeaderboard() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADERBOARD));
      return INITIAL_LEADERBOARD;
    }
    return JSON.parse(saved);
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

// 儲存新紀錄
export function saveScoreToLeaderboard({ name, seconds, moves, accuracy }) {
  try {
    const list = getLeaderboard();
    const newEntry = {
      id: 'score_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name || '挑戰者',
      seconds,
      moves,
      accuracy,
      date: new Date().toLocaleDateString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
      }),
      isCurrent: true,
    };

    // 清除先前標記的 isCurrent
    const updated = list.map((item) => ({ ...item, isCurrent: false }));
    updated.push(newEntry);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEntry.id;
  } catch {
    return null;
  }
}

// 取得依速度排序（最快秒數優先，同秒數依準確率高者優先）
export function getSpeedRankings(list) {
  return [...list].sort((a, b) => {
    if (a.seconds !== b.seconds) {
      return a.seconds - b.seconds;
    }
    return b.accuracy - a.accuracy;
  });
}

// 取得依答對率排序（最高答對率優先，同答對率依秒數少者優先）
export function getAccuracyRankings(list) {
  return [...list].sort((a, b) => {
    if (b.accuracy !== a.accuracy) {
      return b.accuracy - a.accuracy;
    }
    return a.seconds - b.seconds;
  });
}

// 重設排行榜為預設值
export function resetLeaderboard() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADERBOARD));
  return INITIAL_LEADERBOARD;
}
