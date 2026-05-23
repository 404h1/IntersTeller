import { useState, useRef, useEffect } from 'react';
import StatusBar from '../components/StatusBar';
import ConsultSheet from '../components/ConsultSheet';

export default function Page06_FundJoin({ onBack, onNext }) {
  const [step, setStep] = useState(3); // 03/07 or 06/07
  const [amount, setAmount] = useState('');
  const [showConsult, setShowConsult] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);

  const handleNext = () => {
    if (step === 3) setStep(6);
    else onNext();
  };

  const handleKeyPress = (key) => {
    if (key === '⌫') {
      setAmount(prev => prev.slice(0, -1));
    } else {
      setAmount(prev => {
        const newVal = prev + key;
        if (newVal.length > 12) return prev; // limit max digits
        if (newVal === '0' || newVal === '00') return ''; // prevent leading zeros
        return newVal;
      });
    }
  };

  const handleQuickAdd = (type) => {
    let current = parseInt(amount || '0', 10);
    if (type === '+1만') current += 10000;
    if (type === '+10만') current += 100000;
    if (type === '+100만') current += 1000000;
    if (type === '전액') current = 10001; // 출금가능금액
    setAmount(current.toString());
  };

  return (
    <div className="phone-frame">
      <StatusBar />
      <div className="app-header">
        <button className="back-btn" onClick={step === 6 ? () => setStep(3) : onBack} style={{ position: 'absolute', left: 4, zIndex: 100, padding: 12, cursor: 'pointer', background: 'transparent', border: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>펀드 가입하기</h1>
        <div className="right-btns">
          <button onClick={() => setShowConsult(true)}>상담</button>
          <button onClick={onBack}>취소</button>
        </div>
      </div>

      <div className="scroll-content" style={{ padding: '24px 20px 100px' }} onClick={() => showKeypad && setShowKeypad(false)}>
        <div style={{ fontSize: 13, marginBottom: 20 }}>
          <span style={{ fontWeight: 800, color: '#111', fontSize: 15 }}>0{step}</span>
          <span style={{ color: '#aaa', fontSize: 14 }}> / 07</span>
        </div>

        {step === 3 ? (
          <>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 28, lineHeight: 1.35 }}>
              가입정보를<br />입력해주세요
            </div>

            {/* 출금 통장 */}
            <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1b64da', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff' }}>W</div>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>WON통장</span>
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>우리 1002-067-468859</div>
              </div>
              <span style={{ color: '#888', fontSize: 18 }}>∨</span>
            </div>
            <div style={{ textAlign: 'right', fontSize: 13, color: '#1b64da', marginBottom: 24 }}>출금가능금액 10,001원</div>

            {/* 가입금액 */}
            <div 
              style={{ border: showKeypad ? '2px solid #1b64da' : '1.5px solid #e5e7eb', borderRadius: 12, padding: '16px', marginBottom: 4, cursor: 'text' }}
              onClick={(e) => { e.stopPropagation(); setShowKeypad(true); }}
            >
              <div style={{ fontSize: 12, color: showKeypad ? '#1b64da' : '#aaa', marginBottom: 8 }}>가입금액</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                <input
                  type="text"
                  readOnly
                  value={amount ? Number(amount).toLocaleString() : ''}
                  placeholder="10,000원 이상"
                  style={{ border: 'none', outline: 'none', fontSize: 18, fontWeight: 600, color: '#111', textAlign: 'right', width: '100%', background: 'transparent' }}
                />
                {amount && <span style={{ fontSize: 18, color: '#111', fontWeight: 600 }}>원</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 13, color: '#888', marginBottom: 28 }}>
              {amount ? `${Number(amount).toLocaleString()}원` : '0원'}
            </div>

            {/* 꿀머니 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f0f2f5', marginBottom: 24 }}>
              <span style={{ fontSize: 15, color: '#222' }}>꿀머니 사용</span>
              <span style={{ fontSize: 13, color: '#888' }}>사용가능·잔액0꿀 ›</span>
            </div>

            {/* 가입금액 합계 */}
            <div style={{ background: '#eef4ff', borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>가입금액 합계</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1b64da' }}>{amount ? Number(amount).toLocaleString() : '0'}원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#666' }}>선취수수료</span>
                <span style={{ fontSize: 13, color: '#666' }}>0원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#666' }}>실투자금액</span>
                <span style={{ fontSize: 13, color: '#666' }}>{amount ? Number(amount).toLocaleString() : '0'}원</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 28, lineHeight: 1.35 }}>
              펀드 상품을<br />가입하시겠습니까?
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#222', marginBottom: 16 }}>가입정보</div>
              {[
                ['매수예약금액', `${amount ? Number(amount).toLocaleString() : '10,000'}원`],
                ['매수예정일', '2026.05.22', true],
                ['출금계좌번호', '우리은행\n100206*******'],
              ].map(([label, value, isRed]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid #f0f2f5' }}>
                  <span style={{ fontSize: 14, color: '#555' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: isRed ? '#dc2626' : '#111', textAlign: 'right', whiteSpace: 'pre-wrap' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '16px 0', color: '#1b64da', fontSize: 14, cursor: 'pointer', borderBottom: '1px solid #f0f2f5', marginBottom: 20 }}>
              더보기 ∨
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px', fontSize: 12, color: '#666', lineHeight: 1.6 }}>
              ※ 역외펀드의 거래 일정(기준가 적용일 등)은 미리 확정할 수 없으며, 해외운용사 및 투자대상 국가의 영업일에 따라 달라질 수 있습니다.
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '12px 20px 24px', background: '#fff', flexShrink: 0 }}>
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={step === 3 && (!amount || parseInt(amount, 10) < 10000)}
          style={step === 3 && (!amount || parseInt(amount, 10) < 10000) ? { background: '#c0cfe8' } : {}}
        >
          {step === 3 ? '다음' : '가입하기'}
        </button>
      </div>

      {/* 커스텀 키패드 */}
      {showKeypad && step === 3 && (
        <div className="animate-chat-appear" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid #ebecef',
          zIndex: 300, display: 'flex', flexDirection: 'column'
        }}>
          {/* 퀵 추가 버튼 바 */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #ebecef' }}>
            {['+1만', '+10만', '+100만', '전액'].map(btn => (
              <button
                key={btn}
                onClick={() => handleQuickAdd(btn)}
                style={{
                  flex: 1, padding: '8px 0', background: '#fff',
                  border: '1px solid #e5e7eb', borderRadius: 20,
                  fontSize: 13, fontWeight: 600, color: '#333', cursor: 'pointer'
                }}
              >
                {btn}
              </button>
            ))}
          </div>
          {/* 키패드 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫'].map(key => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                style={{
                  padding: '20px 0', fontSize: 24, fontWeight: 500, color: '#111',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderRight: '1px solid #f4f4f4', borderBottom: '1px solid #f4f4f4'
                }}
              >
                {key}
              </button>
            ))}
          </div>
          {/* 키패드 닫기 바 */}
          <div
            onClick={() => setShowKeypad(false)}
            style={{ padding: '12px', textAlign: 'center', background: '#f8fafc', color: '#888', fontSize: 20, cursor: 'pointer', borderTop: '1px solid #ebecef' }}
          >
            ∨
          </div>
        </div>
      )}

      {showConsult && <ConsultSheet onClose={() => setShowConsult(false)} />}
    </div>
  );
}
