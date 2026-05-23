import { useState } from 'react';
import StatusBar from '../components/StatusBar';

const QUESTIONS = [
  {
    title: '가입일자 2026.05.21에 이혜원고객님 명의로 위 상품을 가입한 사실이 맞습니까?',
    options: ['예', '아니요']
  },
  {
    title: '가입하신 상품의 원금손실가능성, 손실가능범위 등 상품의 주요내용 및 투자위험에 대해 충분히 이해하시고 가입하셨나요?',
    options: ['예', '아니요']
  },
  {
    title: '거래신청서, 약관, 규약, 투자설명서 등 상품설명서류 및 계약서류의 내용을 확인하셨나요?',
    options: ['예', '아니요']
  },
  {
    title: '대출에 대한 조건으로 본상품의 가입을 강요받으셨나요?',
    options: ['강요받음', '자발적의사로 가입함']
  },
  {
    title: '가입한 상품이 예금자보호 대상 상품이 아님을 인지하셨나요?',
    options: ['예', '아니요']
  },
  {
    title: '가입한 상품의 원금손실가능성에 대하여 이해하셨나요?',
    options: ['원금손실가능성 있음', '없음(원금보장됨)']
  },
  {
    title: '투자자성향 분석결과에 대한 내용을 읽고 본인의 투자성향에 일치하는 상품에 가입하셨나요?',
    options: ['예', '아니요']
  },
  {
    title: '가입하신 상품의 위법계약해지권 행사가능 사실과 행사방법에 대해 인지하셨나요?',
    options: ['예', '아니요']
  }
];

export default function Page08_HappyCall({ onClose, onDone }) {
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));

  const handleSelect = (qIndex, option) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = option;
    setAnswers(newAnswers);
  };

  const isAllAnswered = answers.every(ans => ans !== null);

  return (
    <div className="phone-frame">
      <StatusBar />
      <div className="app-header">
        <h1>해피콜</h1>
        {!answered && (
          <button onClick={onClose} style={{ position: 'absolute', right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#333' }}>✕</button>
        )}
      </div>

      <div className="scroll-content" style={{ padding: '28px 20px 40px' }}>
        {!answered ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 6, lineHeight: 1.4 }}>
              상품 가입 시 확인한 내용을<br />선택해 주세요{' '}
              <span style={{ fontSize: 16, color: '#aaa', fontWeight: 400 }}>⊙</span>
            </div>

            <div style={{ padding: '20px 0', borderBottom: '1px solid #f0f2f5', marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f2f5' }}>
                <span style={{ fontSize: 14, color: '#888' }}>가입일</span>
                <span style={{ fontSize: 14, color: '#111', fontWeight: 600 }}>2026.05.21</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <span style={{ fontSize: 14, color: '#888' }}>상품명</span>
                <span style={{ fontSize: 13, color: '#111', fontWeight: 600, textAlign: 'right' }}>우리삼성그룹증권자투자신탁1호[주식]A-e</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {QUESTIONS.map((q, qIndex) => (
                <div key={qIndex}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111', lineHeight: 1.6, marginBottom: 16 }}>
                    {q.title}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.options.map(label => {
                      const isSelected = answers[qIndex] === label;
                      return (
                        <div
                          key={label}
                          onClick={() => handleSelect(qIndex, label)}
                          style={{
                            width: '100%',
                            background: isSelected ? '#fff' : '#f8fafc',
                            border: isSelected ? '1.5px solid #1b64da' : '1px solid transparent',
                            borderRadius: 12,
                            padding: '16px',
                            fontSize: 15,
                            color: '#222',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                          }}
                        >
                          {label}
                          <span style={{ color: isSelected ? '#1b64da' : '#ccc', fontWeight: isSelected ? 700 : 400 }}>✓</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40, paddingBottom: 40 }}>
              <button 
                className="btn-primary" 
                onClick={() => setAnswered(true)}
                disabled={!isAllAnswered}
                style={!isAllAnswered ? { background: '#c0cfe8' } : {}}
              >
                다음
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: 120 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#1b64da',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, color: '#fff', marginBottom: 24,
            }}>
              ✓
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 12 }}>해피콜을 등록했어요</div>
            <div style={{ fontSize: 14, color: '#888' }}>[확인]을 누르면 첫 화면으로 이동해요.</div>
          </div>
        )}
      </div>

      {answered && (
        <div style={{ padding: '12px 20px 24px', background: '#fff', flexShrink: 0, position: 'absolute', bottom: 0, width: '100%' }}>
          <button className="btn-primary" onClick={onDone}>확인</button>
        </div>
      )}
    </div>
  );
}
