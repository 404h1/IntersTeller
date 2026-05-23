import StatusBar from '../components/StatusBar';
import ConsultSheet from '../components/ConsultSheet';
import { useState } from 'react';
import botImg from '../assets/bot.png';

export default function Page03b_FundDetail({ onBack, onAI, onJoin }) {
  const [showConsult, setShowConsult] = useState(false);

  return (
    <div className="phone-frame">
      <StatusBar />
      <div className="app-header">
        <button className="back-btn" onClick={onBack} style={{ position: 'absolute', left: 4, zIndex: 100, padding: 12, cursor: 'pointer', background: 'transparent', border: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>안내</h1>
        <button className="right-icon">♡</button>
      </div>

      <div className="scroll-content" style={{ paddingBottom: 80 }}>
        {/* 헤더 영역 */}
        <div style={{ padding: '28px 20px 24px', background: 'linear-gradient(180deg, #eef4ff 0%, #fff 100%)' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#888' }}>글로벌</span>
            <span style={{ color: '#ddd' }}>|</span>
            <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>매우높은위험</span>
            <span style={{ color: '#ddd' }}>|</span>
            <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>원금손실가능</span>
          </div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>삼성글로벌반도체증권자투자신탁UH[주식]Ae</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 20 }}>글로벌 반도체 기업 투자하기</div>

          {/* 테마 태그 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            {[['🌐', 'IT/정보기술'], ['💾', '반도체'], ['🌍', '글로벌']].map(([icon, label]) => (
              <div key={label} style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20,
                padding: '8px 18px', fontSize: 14, color: '#333',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 수익률 / 기준가 카드 */}
        <div style={{ margin: '0 20px 20px', border: '1px solid #e5e7eb', borderRadius: 14, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '20px', borderRight: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>수익률(3개월)</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626' }}>+46.54%</div>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>기준가</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>4,536.55</div>
            <div style={{ fontSize: 13, color: '#dc2626', marginTop: 2 }}>▼ -15.38</div>
          </div>
        </div>

        {/* 안내 */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', gap: 8, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 12 }}>
            <span style={{ color: '#1b64da', fontSize: 14, flexShrink: 0 }}>ℹ</span>
            <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              투자대상, 투자에 따른 위험, 위험등급, 수수료는 금융소비자보호법 제19조 제1항에서 규정하고 있는 중요한 사항입니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 24 }}>
            <div style={{
              background: '#dc2626', borderRadius: 6, padding: '4px 6px',
              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
              lineHeight: 1.3, textAlign: 'center',
            }}>
              예금보험공사<br />비보호
            </div>
            <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              이 금융상품은 예금자보호법에 따라 보호되지 않습니다.
            </p>
          </div>

          <div
            onClick={onAI}
            style={{ background: 'linear-gradient(135deg,#1b64da,#4f9cf9)', borderRadius: 14, padding: '16px 18px', marginBottom: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
              <img src={botImg} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>내 편인 AI가 이 펀드를 쉽게 설명해 드릴게요</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>장단점 · 고객님 맞춤 투자금액 추천 →</div>
            </div>
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: '#111', textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid #f0f2f5' }}>
            펀드정보
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{ padding: '12px 20px 24px', background: '#fff', flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
        <button
          onClick={() => setShowConsult(true)}
          style={{ padding: '16px', background: '#fff', color: '#1b64da', border: '1.5px solid #1b64da', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
        >
          상담
        </button>
        <button className="btn-primary" onClick={onJoin}>상품 가입</button>
      </div>

      {showConsult && <ConsultSheet onClose={() => setShowConsult(false)} />}
    </div>
  );
}
