import { useState } from 'react';
import StatusBar from '../components/StatusBar';
import VoiceGuide from '../components/VoiceGuide';
import { getFundById } from '../data/funds';
import { Icon } from '../components/Icons';

const SCRIPT = '이 펀드는 엔비디아, TSMC 같은 글로벌 AI 반도체 기업에 투자해요. 최근 3개월 수익률 +46%는 같은 폭으로 떨어질 수도 있다는 뜻이에요. 김우리님은 72세 은퇴교사이시고 첫 펀드 가입이시니까, 노후자금 8,000만원 중 의료비·생활비 6,000만원은 꼭 비상금으로 두시고 권장 800만원 정도로 시작하시길 권해드려요. 환매수수료와 해외 주식 환율 영향도 꼭 확인해주세요.';
const AUDIO  = `${import.meta.env.BASE_URL}audio/page03c.mp3`;

export default function Page03c_FundAI({ fundId = 3, onBack, onJoin }) {
  const [tab, setTab] = useState('pros');
  const [showVoice, setShowVoice] = useState(true);
  const fund = getFundById(fundId);
  const adv = fund.customAdvice;

  return (
    <div className="phone-frame">
      <StatusBar />
      <div className="app-header">
        <button className="back-btn" onClick={onBack} style={{ position: 'absolute', left: 4, zIndex: 100, padding: 12, cursor: 'pointer', background: 'transparent', border: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>AI 펀드 설명</h1>
      </div>

      <div className="scroll-content" style={{ paddingBottom: 100 }}>

        <div style={{ padding: '20px 20px 0', background: 'linear-gradient(180deg,#eef4ff 0%,#fff 100%)' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{fund.name}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 16 }}>{fund.shortName} 투자하기</div>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f2f5', margin: '0 20px' }}>
          {[['pros','장점'],['cons','주의'],['fit','적합한 분']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '12px 0', fontSize: 15,
              fontWeight: tab === key ? 700 : 500,
              color: tab === key ? '#1b64da' : '#888',
              background: 'none', border: 'none',
              borderBottom: tab === key ? '2px solid #1b64da' : '2px solid transparent',
              cursor: 'pointer',
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px' }}>
          {tab === 'pros' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {fund.pros.map((item, i) => (
                <div key={i} style={{ background: '#f0f7ff', borderRadius: 14, padding: '16px', display: 'flex', gap: 14 }}>
                  <Icon name={item.icon} size={24} color="#1b64da" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'cons' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {fund.cons.map((item, i) => (
                <div key={i} style={{ background: '#fff5f5', borderRadius: 14, padding: '16px', display: 'flex', gap: 14 }}>
                  <Icon name={item.icon} size={24} color="#dc2626" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'fit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fund.fit.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: item.ok ? '#f0fff4' : '#fff5f5', borderRadius: 12 }}>
                  <Icon name={item.ok ? 'check-circle' : 'x-circle'} size={20} color={item.ok ? '#16a34a' : '#dc2626'} />
                  <span style={{ fontSize: 14, color: '#222', lineHeight: 1.5 }}>{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* 고객 맞춤 조언 카드 */}
          <div style={{ marginTop: 24, background: '#fff', border: '1.5px solid #1b64da', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ background: '#1b64da', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="chat" size={16} color="#fff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>김우리 고객님 맞춤 조언</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>마이데이터 연동 · 우리은행 30년 거래 내역 기반 분석</div>
            </div>

            <div style={{ padding: '16px' }}>
              {[
                { label: '노후자금 총액', value: `${adv.freeFund.toLocaleString()}원`, color: '#111' },
                { label: '권장 비상금 (의료비·생활비)', value: `- ${adv.emergency.toLocaleString()}원`, color: '#dc2626' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f2f5' }}>
                  <span style={{ fontSize: 14, color: '#666' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>추천 첫 투자금액</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#1b64da', display: 'flex', alignItems: 'center', gap: 4 }}>{adv.recommended.toLocaleString()}원 <Icon name="check-circle" size={16} color="#16a34a" /></span>
              </div>

              <div style={{ background: '#f0f7ff', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#1b64da', lineHeight: 1.7, margin: 0 }}>
                  "{adv.message}"
                </p>
              </div>

              <button
                onClick={onJoin}
                style={{ width: '100%', background: '#1b64da', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              >
                {adv.cta}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 20px 24px', background: '#fff', flexShrink: 0 }}>
        <button className="btn-primary" onClick={onJoin}>가입하기</button>
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
            if (cmd.includes('가입') || cmd.includes('시작')) onJoin();
          }}
        />
      )}
    </div>
  );
}
