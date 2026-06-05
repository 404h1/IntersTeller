// 12개 질문 각 옵션별 점수 (option index 0부터, 표준투자권유준칙 단순화 버전)
const QUESTION_SCORES = {
  1:  [4, 3, 2, 1],          // 이해도
  2:  [4, 2, 1],             // 수입원
  3:  [1, 2, 3, 4],          // 연소득
  4:  [5, 4, 3, 2, 1],       // 투자한 금융상품
  5:  [1, 2, 3, 4, 5],       // 자산 대비 투자비중
  6:  [3, 2, 1],             // 가입 목적
  7:  [4, 3, 2, 1],          // 손실 감내 수준
  8:  [4, 3, 2, 1],          // 파생 경험
  9:  [3, 3, 2, 1],          // 자금 성격
  10: [3, 2, 1],             // 원금보존 태도
  11: [1, 2, 3, 4, 5, 6],    // 손실 감내 수준 (구체)
  12: [5, 4, 3, 2, 1],       // 투자 기간
};

/**
 * @param {Object} answers — { 1: optionIndex, 2: optionIndex, ... }
 * @returns {String} '안정형' | '안정추구형' | '위험중립형' | '적극투자형' | '공격투자형'
 */
export function calculateInvestorType(answers) {
  // ── 강제 분류 룰 (총점 무시) ──────────────────────────
  // Q7 마지막 옵션 (원금 보존 절대) → 안정형
  if (answers[7] === 3) return '안정형';
  // Q10 마지막 옵션 (원금보존 추구) → 안정형
  if (answers[10] === 2) return '안정형';
  // Q11 첫 옵션 (원금 보존 추구) → 안정형
  if (answers[11] === 0) return '안정형';
  // Q12 마지막 옵션 (1년 미만) → 안정형
  if (answers[12] === 4) return '안정형';

  // Q9 4번째 옵션 (사용예정자금 단기운용) → 위험중립형 cap
  const isCapped = answers[9] === 3;

  // ── 총점 계산 ────────────────────────────────────────
  let total = 0;
  for (let q = 1; q <= 12; q++) {
    const optIdx = answers[q];
    if (optIdx === undefined) continue;
    const scoreArr = QUESTION_SCORES[q];
    if (scoreArr && scoreArr[optIdx] !== undefined) {
      total += scoreArr[optIdx];
    }
  }

  // ── 유형 결정 ────────────────────────────────────────
  let type;
  if      (total <= 20) type = '안정형';
  else if (total <= 28) type = '안정추구형';
  else if (total <= 36) type = '위험중립형';
  else if (total <= 43) type = '적극투자형';
  else                  type = '공격투자형';

  // cap 적용
  if (isCapped) {
    const order = ['안정형', '안정추구형', '위험중립형', '적극투자형', '공격투자형'];
    const cur = order.indexOf(type);
    const cap = order.indexOf('위험중립형');
    if (cur > cap) type = '위험중립형';
  }

  return type;
}

// 유형별 설명
export const TYPE_DESCRIPTIONS = {
  '안정형': '원금 손실을 거의 감수하지 않으며, 예금·국채 수준의 안정적 수익을 추구합니다.',
  '안정추구형': '제한적 손실은 감수하나, 주로 채권 중심의 보수적 운용을 선호합니다.',
  '위험중립형': '수익을 위해 일정 수준의 손실 위험을 감수할 의향이 있습니다.',
  '적극투자형': '시장 평균을 넘는 수익을 위해 상당한 손실 위험을 수용합니다.',
  '공격투자형': '시장평균 수익률을 훨씬 넘어서는 높은 수준의 투자수익을 추구하며, 이를 위해 자산가치의 변동에 따른 손실 위험을 적극 수용, 투자자금 대부분을 주식, 주식형펀드 또는 파생상품 등의 위험자산에 투자할 의향이 있음',
};
