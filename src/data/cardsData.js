export const CARD_PAIRS = [
  {
    pairId: 1,
    name: '璀璨星芒',
    icon: '🌟',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    glowColor: 'rgba(251, 191, 36, 0.6)',
  },
  {
    pairId: 2,
    name: '星際飛船',
    icon: '🚀',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    glowColor: 'rgba(96, 165, 250, 0.6)',
  },
  {
    pairId: 3,
    name: '極光鑽石',
    icon: '💎',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #38bdf8 100%)',
    glowColor: 'rgba(56, 189, 248, 0.6)',
  },
  {
    pairId: 4,
    name: '幻彩星球',
    icon: '🪐',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)',
    glowColor: 'rgba(192, 132, 252, 0.6)',
  },
  {
    pairId: 5,
    name: '熾焰之火',
    icon: '🔥',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    glowColor: 'rgba(249, 115, 22, 0.6)',
  },
  {
    pairId: 6,
    name: '幸運四葉',
    icon: '🍀',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    glowColor: 'rgba(52, 211, 153, 0.6)',
  },
  {
    pairId: 7,
    name: '雷霆電擊',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #eab308 0%, #facc15 100%)',
    glowColor: 'rgba(250, 204, 21, 0.6)',
  },
  {
    pairId: 8,
    name: '秘境水晶',
    icon: '🔮',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    glowColor: 'rgba(244, 114, 182, 0.6)',
  },
];

// Fisher-Yates 洗牌演算法
export function generateDeck() {
  const cards = [];
  CARD_PAIRS.forEach((item) => {
    // 每一種產生兩張
    cards.push({
      id: `${item.pairId}-a`,
      pairId: item.pairId,
      name: item.name,
      icon: item.icon,
      gradient: item.gradient,
      glowColor: item.glowColor,
    });
    cards.push({
      id: `${item.pairId}-b`,
      pairId: item.pairId,
      name: item.name,
      icon: item.icon,
      gradient: item.gradient,
      glowColor: item.glowColor,
    });
  });

  // 洗牌
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}
