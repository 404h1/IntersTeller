import { useState, useEffect, useRef } from 'react';
import StatusBar from '../components/StatusBar';

export default function Page05_InvestorCheck({ onClose }) {
  const [step, setStep] = useState(0);
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  
  const bottomRef = useRef(null);

  useEffect(() => {
    // 렌더링 후 약간의 딜레이를 주어 애니메이션이 시작될 때 스크롤이 자연스럽게 따라가도록 함
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [step]);

  return (
    <div className="phone-frame">
      <StatusBar />
      <div className="app-header">
        <h1>투자자 정보확인</h1>
        <button onClick={onClose} style={{ position: 'absolute', right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#333', zIndex: 100, padding: 12 }}>✕</button>
      </div>

      <div className="scroll-content" style={{ padding: '20px 20px 24px' }}>
        {/* 봇 + Q1 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🤖</div>
          <div style={{ background: '#f2f4f6', borderRadius: '4px 16px 16px 16px', padding: '14px 16px', fontSize: 14, color: '#222', lineHeight: 1.6 }}>
            이혜원 고객님, 안녕하세요.<br />
            투자 상품에 가입하기 위해 아래 질문에<br />
            답해주세요.
          </div>
        </div>

        {/* Q1 질문 박스 */}
        <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: '#222', lineHeight: 1.7, marginBottom: 14 }}>
            <span style={{ color: '#1b64da', fontWeight: 600 }}>1개월내</span> 대출(신규, 증대, 재약정)을 받으셨거나, 받을 예정이신가요? 투자상품 신규나 대출상품 가입이 제한될 수 있어요.
          </p>
          {step === 0 && (
            <>
              {['아니요', '예'].map(label => (
                <button
                  key={label}
                  onClick={() => { setAns1(label); setStep(1); }}
                  style={{
                    width: '100%', background: '#fff', border: '1px solid #e5e7eb',
                    borderRadius: 10, padding: '14px 16px', fontSize: 15,
                    color: '#222', cursor: 'pointer', marginBottom: 8,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  {label} <span style={{ color: '#ccc' }}>✓</span>
                </button>
              ))}
              <div style={{ textAlign: 'right', fontSize: 13, color: '#888', cursor: 'pointer', marginTop: 4 }}>자세히 보기 ›</div>
            </>
          )}
          {step >= 1 && (
            <>
              {['아니요', '예'].map(label => (
                <div key={label} style={{
                  width: '100%', background: '#f0f2f5', border: '1px solid #e5e7eb',
                  borderRadius: 10, padding: '14px 16px', fontSize: 15,
                  color: '#aaa', marginBottom: 8,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: ans1 === label ? '#111' : '#aaa', fontWeight: ans1 === label ? 700 : 400 }}>{label}</span>
                  <span style={{ color: ans1 === label ? '#1b64da' : '#ccc' }}>✓</span>
                </div>
              ))}
              <div style={{ textAlign: 'right', fontSize: 13, color: '#aaa', marginTop: 4 }}>자세히 보기 ›</div>
            </>
          )}
        </div>

        {/* Q1 선택 응답 */}
        {step >= 1 && (
          <>
            <div className="animate-chat-appear" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <div style={{ background: '#e8effd', borderRadius: '16px 4px 16px 16px', padding: '12px 16px', fontSize: 14, color: '#111', fontWeight: 700 }}>
                {ans1} <span style={{ color: '#1b64da' }}>✏</span>
              </div>
            </div>

            {/* 봇 + Q2 */}
            <div className="animate-chat-appear" style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🤖</div>
              <div style={{ flex: 1 }}>
                <div style={{ background: '#f8fafc', borderRadius: '4px 16px 16px 16px', padding: '16px' }}>
                  <p style={{ fontSize: 14, color: '#222', lineHeight: 1.7, marginBottom: 14 }}>
                    고객님은 금융투자업자(증권사)로부터 확인받은 전문금융소비자인가요?
                  </p>
                  {step === 1 && (
                    <>
                      {['아니오', '예'].map(label => (
                        <button
                          key={label}
                          onClick={() => { setAns2(label); setStep(2); }}
                          style={{
                            width: '100%', background: '#fff', border: '1px solid #e5e7eb',
                            borderRadius: 10, padding: '14px 16px', fontSize: 15,
                            color: '#222', cursor: 'pointer', marginBottom: 8,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}
                        >
                          {label} <span style={{ color: '#ccc' }}>✓</span>
                        </button>
                      ))}
                      <div style={{ textAlign: 'right', fontSize: 13, color: '#888', cursor: 'pointer', marginTop: 4 }}>전문 금융소비자란? ›</div>
                    </>
                  )}
                  {step >= 2 && (
                    <>
                      {['아니오', '예'].map(label => (
                        <div key={label} style={{
                          background: '#f0f2f5', border: '1px solid #e5e7eb',
                          borderRadius: 10, padding: '14px 16px', fontSize: 15,
                          color: '#aaa', marginBottom: 8,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <span style={{ color: ans2 === label ? '#111' : '#aaa', fontWeight: ans2 === label ? 700 : 400 }}>{label}</span>
                          <span style={{ color: ans2 === label ? '#1b64da' : '#ccc' }}>✓</span>
                        </div>
                      ))}
                      <div style={{ textAlign: 'right', fontSize: 13, color: '#aaa', marginTop: 4 }}>전문 금융소비자란? ›</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Q2 선택 + 안내 */}
        {step >= 2 && (
          <>
            <div className="animate-chat-appear" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <div style={{ background: '#e8effd', borderRadius: '16px 4px 16px 16px', padding: '12px 16px', fontSize: 14, color: '#111', fontWeight: 700 }}>
                {ans2} <span style={{ color: '#1b64da' }}>✏</span>
              </div>
            </div>

            <div className="animate-chat-appear" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🤖</div>
              <div style={{ flex: 1, background: '#f8fafc', borderRadius: '4px 16px 16px 16px', padding: '16px' }}>
                <p style={{ fontSize: 14, color: '#222', marginBottom: 16 }}>고객님은 현재 일반금융소비자로 등록되어있습니다.</p>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>금융소비자 유의사항</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 8 }}>집합투자상품</div>
                  {[
                    ['#1b64da', '이 금융상품은 ', '예금자보호법에 따라 보호되지 않습니다.', '#1b64da'],
                    ['#444', '운용실적에 따라 ', '원금손실이 발생할', '#dc2626'],
                    ['#444', '환매 또는 해지시 환매수수료가 발생할 수 있습니다. 또한 집합투자규약 및 투자설명서에 따라 중도인출이 불가할 수 있습니다.', '', ''],
                  ].map(([c, t1, t2, c2], i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <span style={{ color: '#999', flexShrink: 0 }}>•</span>
                      <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>
                        {t1}{t2 && <span style={{ color: c2, fontWeight: 600 }}>{t2} 수 있으며, 손실가능범위는 각 상품에 따라 다를 수 있습니다.</span>}
                      </p>
                    </div>
                  ))}
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginTop: 12, marginBottom: 8 }}>신탁, 퇴직연금, 일임형 ISA</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ color: '#999' }}>•</span>
                    <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>예금자보호여부 및 보호한도, 원금손실가능성, 중도해지시 불이익, 세율, 종합소득세신고 대상여부 등이 각 상품에 따라 다를 수 있습니다.</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  style={{
                    width: '100%', background: '#f2f4f6', border: '1px solid #e5e7eb',
                    borderRadius: 10, padding: '14px 16px', fontSize: 15,
                    color: '#555', cursor: 'pointer', marginTop: 8,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  확인했어요. <span style={{ color: '#1b64da' }}>✓</span>
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* 스크롤을 맨 아래로 내리기 위한 투명한 앵커 */}
        <div ref={bottomRef} style={{ height: 10 }} />
      </div>
    </div>
  );
}
