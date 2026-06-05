import { useState, useEffect } from 'react';
import StatusBar from '../components/StatusBar';
import VoiceGuide from '../components/VoiceGuide';
import { Icon } from '../components/Icons';
import { TYPE_DESCRIPTIONS } from '../data/investorScore';

const SCRIPT = '김우리 고객님, 투자성향 분석 결과가 나왔어요. 펀드는 처음이시니까, 본인 성향이 어떻게 나왔는지 그리고 그 뜻이 무엇인지 한 번 더 확인해보세요. 72세 은퇴교사이시고 노후자금이라, 성향과 맞지 않는 상품에 가입하시면 금융소비자보호법에 따라 부적합 안내가 나갈 수 있어요.';
const AUDIO  = `${import.meta.env.BASE_URL}audio/page02.mp3`;

const TYPE_COLORS = {
  '안정형':     { bar: '#22c55e', text: '#16a34a', highlight: 0 },
  '안정추구형': { bar: '#84cc16', text: '#65a30d', highlight: 1 },
  '위험중립형': { bar: '#eab308', text: '#ca8a04', highlight: 2 },
  '적극투자형': { bar: '#f97316', text: '#ea580c', highlight: 3 },
  '공격투자형': { bar: '#dc2626', text: '#dc2626', highlight: 4 },
};

export default function Page02_InvestmentResult({ investorType = '공격투자형', onNext, onBack }) {
  const [animated, setAnimated] = useState(false);
  const [showVoice, setShowVoice] = useState(true);
  const colors = TYPE_COLORS[investorType] || TYPE_COLORS['공격투자형'];
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const types = ['안정형', '안정\n추구형', '위험\n중립형', '적극\n투자형', '공격\n투자형'];

  return (
    <div className="phone-frame">
      <StatusBar />
      <div className="app-header">
        <button className="back-btn" onClick={onBack} style={{ position: 'absolute', left: 4, zIndex: 100, padding: 12, cursor: 'pointer', background: 'transparent', border: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>투자성향분석 결과</h1>
        <button className="right-icon" style={{ color: '#888', fontSize: 16 }}>↓</button>
      </div>

      <div className="scroll-content" style={{ padding: '28px 20px 100px' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#111', lineHeight: 1.35, marginBottom: 16 }}>
          김우리님의 투자성향은<br />
          <span style={{ color: colors.text }}>{investorType}</span>입니다.
        </div>

        <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
          투자성향분석일: 2026.05.21
        </div>

        <div style={{ fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: 32 }}>
          {TYPE_DESCRIPTIONS[investorType]}
        </div>

        {/* 투자성향 차트 */}
        <div style={{
          background: '#f8fafc', borderRadius: 16, padding: '20px 16px 16px',
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
            ↑ 기대수익률
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', marginBottom: 12, height: 96 }}>
            {types.map((t, i) => {
              const isMine = i === colors.highlight;
              return (
                <div key={i} style={{
                  flex: 1,
                  background: isMine ? colors.bar : '#e5e7eb',
                  borderRadius: 10,
                  height: animated ? (40 + i * 14) : 0,
                  transition: 'height 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: isMine ? 700 : 400,
                    color: isMine ? '#fff' : '#555',
                    whiteSpace: 'pre-wrap', textAlign: 'center',
                    lineHeight: 1.3,
                    flexShrink: 0
                  }}>
                    {t}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: '#888', textAlign: 'right' }}>위험도 →</div>
        </div>

        {/* 안내 박스 */}
        <div style={{
          background: '#f8fafc', borderRadius: 12, padding: '16px',
          border: '1px solid #e5e7eb', marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, color: '#444', lineHeight: 1.7, marginBottom: 12, display: 'flex', gap: 6 }}>
            <span style={{ color: '#1b64da', flexShrink: 0 }}>ℹ</span>
            <strong>단, 다음의 경우 설문항목의 답변에 따라 총점 상관없이 성향이 자동분류됩니다.</strong>
          </div>
          {[
            '투자원금이 보전되어야 하는 경우 (7번 질문 4번 답변, 10번 질문 3번 답변, 11번 질문 1번 답변) → 안정형',
            '투자기간이 1년 미만인 경우 (12번 질문 5번 답변) → 안정형',
            '사용예정자금(전세금, 임대차보증금) 단기운용인 경우 (9번 질문 4번 답변) → 위험중립형 이하',
          ].map((text, i) => (
            <div key={i} style={{ fontSize: 13, color: '#555', lineHeight: 1.7, paddingLeft: 8 }}>
              {i + 1}. {text}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{ padding: '12px 20px 24px', background: '#fff', flexShrink: 0 }}>
        <button className="btn-primary" onClick={onNext}>확인</button>
      </div>

      {!showVoice && (
        <button className="voice-fab" onClick={() => setShowVoice(true)}><Icon name="volume" size={24} color="#fff" /></button>
      )}
      {showVoice && (
        <VoiceGuide
          script={SCRIPT}
          audio={AUDIO}
          onClose={() => setShowVoice(false)}
          onCommand={(cmd) => {
            if (cmd.includes('확인') || cmd.includes('다음')) onNext();
          }}
        />
      )}
    </div>
  );
}
