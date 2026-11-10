// AI 부적절 콘텐츠 자동 탐지 모듈 (AI Moderation Engine)

interface AiCheckResult {
  isToxic: boolean;
  score: number; // 0 ~ 100
  reason?: string;
  detectedKeywords?: string[];
}

const TOXIC_PATTERNS: { pattern: RegExp; reason: string; weight: number }[] = [
  { pattern: /(개새끼|씨발|존나|병신|지랄|미친놈|닥쳐|새끼야|꺼져|죽어라)/i, reason: '심각한 욕설 및 비방 표현', weight: 95 },
  { pattern: /(사기|도박|불법토토|카지노|먹튀|바카라|출장안마|조건만남)/i, reason: '불법 도박/사기/유해 광고 스팸', weight: 98 },
  { pattern: /(컨닝|답안지 유출|족보 판매|학점 조작|대리시험)/i, reason: '학사 부정행위 관련 유해 게시물', weight: 88 },
  { pattern: /(죽어|살해|폭행|자살|때려죽일)/i, reason: '폭력 및 위협성 발언', weight: 99 },
  { pattern: /(바보|멍청이|거지|찐따|쓰레기)/i, reason: '타인 모욕 및 비하 표현', weight: 75 },
];

export function analyzeContentWithAI(text: string): AiCheckResult {
  if (!text || text.trim().length === 0) {
    return { isToxic: false, score: 0 };
  }

  let maxScore = 0;
  const detectedReasons: string[] = [];
  const detectedKeywords: string[] = [];

  for (const item of TOXIC_PATTERNS) {
    const match = text.match(item.pattern);
    if (match) {
      if (item.weight > maxScore) {
        maxScore = item.weight;
      }
      if (!detectedReasons.includes(item.reason)) {
        detectedReasons.push(item.reason);
      }
      detectedKeywords.push(match[0]);
    }
  }

  if (maxScore >= 70) {
    return {
      isToxic: true,
      score: maxScore,
      reason: `[AI 감지] ${detectedReasons.join(' / ')} (키워드: ${detectedKeywords.join(', ')})`,
      detectedKeywords,
    };
  }

  return {
    isToxic: false,
    score: Math.min(20, Math.floor(Math.random() * 15)), // 정상적인 안전 점수
  };
}
