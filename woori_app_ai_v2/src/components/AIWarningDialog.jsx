import { useState, useEffect, useRef } from 'react';
import botImg from '../assets/bot.png';
import { Icon } from './Icons';

/**
 * AI 경고 다이얼로그 — 가입 직전, 사용자 자산/펀드 정보 기반으로 3개 경고를 채팅 형태로 던짐.
 * 각 경고마다 "네, 그래도 진행할게요" / "다시 생각해볼게요" 선택.
 * 하나라도 "다시 생각" 누르면 onCancel.
 * 3개 모두 confirm 하면 onConfirm.
 */
export default function AIWarningDialog({ fund, investAmount, onConfirm, onCancel }) {
  const scrollRef = useRef(null);
  const [stage, setStage]   = useState(0); // 0~5: 인사 / Q1 / A1 / Q2 / A2 / Q3 / A3 / done
  const [answers, setAnswers] = useState([]); // ['proceed' | 'rethink', ...]

  const adv = fund.customAdvice;
  const overRecommended = investAmount > adv.recommended;
  const concentrationPct = ((investAmount / adv.freeFund) * 100).toFixed(0);
  const recRatio = (investAmount / adv.recommended).toFixed(1);

  // 펀드별 손실 시나리오 (역사적 최악)
  const worstYear = fund.region === '글로벌' ? '2022년 미국 긴축기' : '2022년';
  const worstLoss = -34; // 시뮬레이션
  const lossAmount = Math.round(investAmount * (1 + worstLoss / 100));

  const warnings = [
    {
      icon: 'money-loss',
      title: '유동성·노후자금 경고',
      message: overRecommended
        ? `김우리님 노후자금 8,000만원 중 의료비·생활비 ${adv.emergency.toLocaleString()}원은 꼭 비상금으로 두시도록 권해드렸어요. 지금 입력하신 ${investAmount.toLocaleString()}원은 권장 첫 투자금(${adv.recommended.toLocaleString()}원)의 ${recRatio}배예요. 이 펀드는 환매까지 3영업일 + 3개월 미만 환매 시 이익금의 70%가 수수료로 빠져요. 72세시라 갑자기 의료비가 필요해도 즉시 현금화가 어려워요.`
        : `이 펀드는 환매까지 3영업일 + 3개월 미만 환매 시 이익금의 70%가 수수료로 빠져요. 노후자금이라 갑자기 돈이 필요해도 즉시 현금화가 어려워요.`,
      question: overRecommended
        ? '예상치 못한 의료비·생활비가 생겨도 이 금액을 3개월 이상 묶어둘 수 있으세요?'
        : '예상치 못한 의료비가 생겨도 3개월 이상 묶어둘 수 있으세요?',
    },
    {
      icon: 'chart-down',
      title: '변동성·회복 시뮬레이션',
      message: `최근 3개월 ${fund.return3m}이지만, ${worstYear}에는 ${worstLoss}% 손실 사례가 있어요. 같은 상황이 오면 ${investAmount.toLocaleString()}원이 ${lossAmount.toLocaleString()}원이 됩니다 (-${(investAmount - lossAmount).toLocaleString()}원). 김우리님은 72세 은퇴교사이시라 손실이 나도 다시 모으실 기간이 짧고, 노후 생활자금은 회복이 어려워요.`,
      question: '이 손실이 노후에 실제로 났을 때 후회하지 않으실 자신 있으세요?',
    },
    {
      icon: 'target',
      title: '집중도·첫 펀드 경고',
      message: `김우리님 노후자금 8,000만원 중 ${concentrationPct}%를 이 한 펀드에 넣으시는 거예요. 게다가 첫 펀드 가입이시고, ${fund.region === '글로벌' ? '글로벌 AI 반도체라는 한 산업이라 변동성이 크고, 해외 주식이라 환율 변동까지 추가로 받아요.' : '한 산업에 집중되면 그 업황 악화 시 분산 효과가 사라져요.'} 처음이시면 권장 ${adv.recommended.toLocaleString()}원으로 감 잡으시는 걸 권해드려요.`,
      question: `그래도 ${investAmount.toLocaleString()}원 그대로 진행하시겠어요?`,
    },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [stage]);

  // 초기 진입 시 0.5초 후 첫 인사
  useEffect(() => {
    const t = setTimeout(() => setStage(1), 600);
    return () => clearTimeout(t);
  }, []);

  const handleAnswer = (idx, choice) => {
    const next = [...answers, choice];
    setAnswers(next);
    if (choice === 'rethink') {
      // 다시 생각 → 즉시 cancel
      setTimeout(onCancel, 400);
      return;
    }
    if (next.length === warnings.length) {
      // 모두 confirm → 0.6초 후 최종 진행
      setTimeout(onConfirm, 800);
    } else {
      // 다음 경고로 진행
      setTimeout(() => setStage(s => s + 2), 600);
    }
  };

  const currentWarningIdx = Math.floor((stage - 1) / 2);
  const isAnsweredStage = stage % 2 === 0 && stage > 0;

  return (
    <>
      {/* 배경 dim */}
      <div style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500,
        animation: 'fadeIn 0.3s ease-out',
      }} onClick={(e) => e.stopPropagation()} />

      {/* 풀스크린 채팅 */}
      <div style={{
        position: 'absolute', inset: 0, background: '#f8fafc',
        zIndex: 501, display: 'flex', flexDirection: 'column',
        animation: 'slideUpFade 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '16px 20px', background: '#fff',
          borderBottom: '1px solid #f0f2f5',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <img src={botImg} alt="bot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>WON AI 뱅커 — 최종 확인</div>
            <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>● 가입 전 위험 안내 진행 중</div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div ref={scrollRef} style={{
          flex: 1, overflowY: 'auto', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {/* 인사 메시지 */}
          {stage >= 1 && (
            <BotMessage delay={0}>
              <div style={{ fontSize: 14, color: '#111', lineHeight: 1.6 }}>
                <strong>김우리 고객님,</strong> 첫 펀드 가입이시니까 가입 전에 3가지만 꼭 확인할게요.<br />
                마이데이터로 분석한 결과, <strong style={{ color: '#dc2626' }}>노후자금 보호를 위해 주의해야 할 점</strong>이 있어요.
              </div>
            </BotMessage>
          )}

          {warnings.map((w, idx) => {
            const showWarning = stage >= 1 + idx * 2;
            const showAnswered = answers.length > idx;
            if (!showWarning) return null;

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <BotMessage delay={idx === 0 ? 0.6 : 0}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Icon name={w.icon} size={18} color="#dc2626" />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>경고 {idx + 1}. {w.title}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7, marginBottom: 12 }}>{w.message}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.6 }}>{w.question}</div>
                  </div>
                </BotMessage>

                {/* 사용자 응답 */}
                {showAnswered && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      background: '#e8effd', color: '#111', padding: '12px 16px',
                      borderRadius: '20px 4px 20px 20px', fontSize: 14, fontWeight: 600,
                    }}>
                      {answers[idx] === 'proceed' ? '네, 그래도 진행할게요' : '다시 생각해볼게요'}
                    </div>
                  </div>
                )}

                {/* 응답 버튼 (아직 안 누른 경고만) */}
                {!showAnswered && (idx === currentWarningIdx) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    <button
                      onClick={() => handleAnswer(idx, 'rethink')}
                      style={{
                        padding: '14px', background: '#fff', color: '#dc2626',
                        border: '1.5px solid #dc2626', borderRadius: 12,
                        fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      다시 생각해볼게요
                    </button>
                    <button
                      onClick={() => handleAnswer(idx, 'proceed')}
                      style={{
                        padding: '14px', background: '#f2f4f6', color: '#555',
                        border: 'none', borderRadius: 12,
                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      네, 그래도 진행할게요
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* 모두 confirm 완료 */}
          {answers.length === warnings.length && answers.every(a => a === 'proceed') && (
            <BotMessage delay={0}>
              <div style={{ fontSize: 14, color: '#111', lineHeight: 1.6 }}>
                모든 위험을 확인하셨어요. 가입 절차로 이동할게요.
              </div>
            </BotMessage>
          )}
        </div>
      </div>
    </>
  );
}

function BotMessage({ children, delay = 0 }) {
  return (
    <div className="animate-chat-appear" style={{ display: 'flex', gap: 10, animationDelay: `${delay}s`, opacity: 0, animationFillMode: 'forwards' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
        <img src={botImg} alt="bot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{
        flex: 1, background: '#fff', padding: '14px 16px',
        borderRadius: '4px 16px 16px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {children}
      </div>
    </div>
  );
}
