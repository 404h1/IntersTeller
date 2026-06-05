import { useState } from 'react';
import StatusBar from '../components/StatusBar';
import VoiceGuide from '../components/VoiceGuide';
import { FUND_LIST } from '../data/funds';
import { Icon } from '../components/Icons';

const SCRIPT = '여기 보이는 펀드는 대부분 매우높은위험 등급이에요. 수익률 숫자가 커 보여도, 과거 수익률이 미래를 보장하지는 않아요. 예금자보호 대상이 아니라서 노후자금이 손실될 수도 있다는 점, 꼭 기억해주세요. 김우리님은 첫 펀드시니까 펀드 이름을 누르고 자세한 내용을 차근차근 보세요.';
const AUDIO  = `${import.meta.env.BASE_URL}audio/page03.mp3`;

export default function Page03_FundList({ investorType = '공격투자형', onFundDetail, onCompare, onBack }) {
  const [selected, setSelected] = useState([]);
  const [showVoice, setShowVoice] = useState(true);

  const toggleSelect = (fund) => {
    setSelected(prev => {
      const exists = prev.find(f => f.id === fund.id);
      if (exists) return prev.filter(f => f.id !== fund.id);
      if (prev.length >= 2) return prev;
      return [...prev, fund];
    });
  };

  const isSelected = (id) => selected.some(f => f.id === id);

  const handleCompare = () => {
    if (selected.length === 2 && onCompare) {
      onCompare(selected.map(f => f.id));
    }
  };

  return (
    <div className="phone-frame">
      <StatusBar />
      <div className="app-header">
        <button className="back-btn" onClick={onBack} style={{ position: 'absolute', left: 4, zIndex: 100, padding: 12, cursor: 'pointer', background: 'transparent', border: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>수익률 BEST</h1>
        <button className="right-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 6H22L20 13H9L7 6ZM7 6L5.5 3H2M9 18C9 19.1046 8.10457 20 7 20C5.89543 20 5 19.1046 5 18C5 16.8954 5.89543 16 7 16C8.10457 16 9 16.8954 9 18ZM21 18C21 19.1046 20.1046 20 19 20C17.8954 20 17 19.1046 17 18C17 16.8954 17.8954 16 19 16C20.1046 16 21 16.8954 21 18Z" stroke="#3F444D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="scroll-content" style={{ paddingBottom: selected.length > 0 ? 120 : 20 }}>
        {/* 투자성향 배너 */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5' }}>
          <div style={{ fontSize: 14, color: '#222', lineHeight: 1.6, marginBottom: 6 }}>
            고객님의 투자성향은 <strong style={{ color: '#dc2626' }}>{investorType}</strong>입니다.<br />
            <span style={{ color: '#dc2626', fontWeight: 600 }}>매우높은위험</span> 등급 이하의 상품만 조회됩니다.
          </div>
          <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
            ※ 과거수익률이 미래수익률을 보장하지 않습니다.<br />
            ※ 이 금융상품은 예금자보호법에 따라 보호되지 않습니다.
          </div>
        </div>

        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FUND_LIST.map(fund => (
            <div
              key={fund.id}
              onClick={() => onFundDetail && onFundDetail(fund.id)}
              style={{
                background: '#fff',
                border: isSelected(fund.id) ? '2px solid #1b64da' : '1.5px solid #e5e7eb',
                borderRadius: 14,
                padding: '16px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <span className={`tag ${fund.riskClass}`}>{fund.risk}</span>
                <span className="tag tag-pink">{fund.extra}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {fund.name}
                <span style={{ fontSize: 18, color: '#999', flexShrink: 0, marginLeft: 4 }}>›</span>
              </div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
                {fund.region} | {fund.fee} | {fund.channel}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(fund); }}
                  style={{
                    background: isSelected(fund.id) ? '#1b64da' : '#f2f4f6',
                    color: isSelected(fund.id) ? '#fff' : '#555',
                    border: 'none', borderRadius: 20,
                    padding: '7px 16px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {isSelected(fund.id) ? '✓ 비교담기' : '∨ 비교담기'}
                </button>
                <div style={{ fontSize: 13, color: '#555' }}>
                  3개월 수익률 <strong style={{ color: '#dc2626' }}>{fund.return3m}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid #f0f2f5',
          padding: '12px 16px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>
              선택된 상품 <span style={{ color: '#1b64da' }}>{selected.length}개</span>
            </span>
            {selected.length === 2 && (
              <button
                onClick={handleCompare}
                style={{
                  background: '#1b64da', color: '#fff', border: 'none',
                  borderRadius: 20, padding: '8px 20px',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                비교하기
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {selected.map(f => (
              <div key={f.id} style={{
                background: '#f2f4f6', borderRadius: 20, padding: '6px 12px',
                fontSize: 12, color: '#333', display: 'flex', alignItems: 'center', gap: 6,
                maxWidth: '45%', overflow: 'hidden',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name.slice(0, 10)}...
                </span>
                <button onClick={() => toggleSelect(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 14, flexShrink: 0 }}>×</button>
              </div>
            ))}
            {selected.length < 2 && (
              <div style={{
                background: '#f2f4f6', borderRadius: 20, padding: '6px 16px',
                fontSize: 12, color: '#aaa',
              }}>
                추가하기
              </div>
            )}
          </div>
        </div>
      )}

      {!showVoice && (
        <button className="voice-fab" style={{ bottom: selected.length > 0 ? 140 : 100 }} onClick={() => setShowVoice(true)}><Icon name="volume" size={24} color="#fff" /></button>
      )}
      {showVoice && (
        <VoiceGuide
          script={SCRIPT}
          audio={AUDIO}
          onClose={() => setShowVoice(false)}
          onCommand={(cmd) => {
            if (cmd.includes('비교')) handleCompare();
          }}
        />
      )}
    </div>
  );
}
