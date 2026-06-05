import StatusBar from '../components/StatusBar';
import { getFundById } from '../data/funds';

export default function Page04_FundCompare({ fundIds = [3, 7], onBack, onJoin }) {
  const a = getFundById(fundIds[0]);
  const b = getFundById(fundIds[1] ?? fundIds[0]);

  const ROWS = [
    { section: '기본정보', label: '상품개요', aVal: a.overview, bVal: b.overview },
    { label: '위험등급', aVal: a.risk, bVal: b.risk },
    { label: '투자지역', aVal: a.region, bVal: b.region },
    { label: '총보수', aVal: a.totalFee, bVal: b.totalFee },
    { label: '선취수수료', aVal: a.feeDetail, bVal: b.feeDetail },
    { label: '기준가', aVal: a.standardPrice, bVal: b.standardPrice },
    { section: '편입 상위 종목', label: '1위', aVal: `${a.top5[0].name}\n${a.top5[0].weight}`, bVal: `${b.top5[0].name}\n${b.top5[0].weight}` },
    { label: '2위', aVal: `${a.top5[1].name}\n${a.top5[1].weight}`, bVal: `${b.top5[1].name}\n${b.top5[1].weight}` },
    { label: '3위', aVal: `${a.top5[2].name}\n${a.top5[2].weight}`, bVal: `${b.top5[2].name}\n${b.top5[2].weight}` },
    { label: '4위', aVal: `${a.top5[3].name}\n${a.top5[3].weight}`, bVal: `${b.top5[3].name}\n${b.top5[3].weight}` },
    { label: '5위', aVal: `${a.top5[4].name}\n${a.top5[4].weight}`, bVal: `${b.top5[4].name}\n${b.top5[4].weight}` },
    { section: '수익률', label: '3개월', aRed: a.return3m, bRed: b.return3m },
    { label: '12개월', aRed: a.return12m, bRed: b.return12m },
  ];

  return (
    <div className="phone-frame">
      <StatusBar />
      <div className="app-header">
        <button className="back-btn" onClick={onBack} style={{ position: 'absolute', left: 4, zIndex: 100, padding: 12, cursor: 'pointer', background: 'transparent', border: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>펀드 비교하기</h1>
      </div>

      <div className="scroll-content" style={{ paddingBottom: 140 }}>
        {/* 상단 펀드 헤더 */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          padding: '16px', borderBottom: '1px solid #f0f2f5',
        }}>
          {[a, b].map((fund, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className={`tag ${fund.riskClass}`}>{fund.risk}</span>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.4 }}>{fund.shortName}</div>
              <div style={{ fontSize: 11, color: '#888', lineHeight: 1.4 }}>{fund.name}</div>
              <button
                onClick={() => onJoin?.(fund.id)}
                style={{
                  background: '#1b64da', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                가입하기
              </button>
            </div>
          ))}
        </div>

        {/* 장단점 비교 카드 */}
        <div style={{ padding: '16px', background: '#f8fafc' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#222', marginBottom: 12 }}>장단점 한눈에 비교</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[a, b].map((fund, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 8, fontWeight: 600 }}>{fund.shortName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>
                  <Icon name="check-circle" size={12} color="#16a34a" /><span>장점</span>
                </div>
                <ul style={{ paddingLeft: 14, margin: '0 0 10px 0', fontSize: 11, color: '#444', lineHeight: 1.6 }}>
                  {fund.pros.slice(0, 3).map((p, idx) => <li key={idx}>{p.title}</li>)}
                </ul>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>
                  <Icon name="warning" size={12} color="#dc2626" /><span>주의</span>
                </div>
                <ul style={{ paddingLeft: 14, margin: 0, fontSize: 11, color: '#444', lineHeight: 1.6 }}>
                  {fund.cons.slice(0, 3).map((c, idx) => <li key={idx}>{c.title}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 비교 테이블 */}
        {ROWS.map((row, i) => (
          <div key={i}>
            {row.section && (
              <div style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 700, fontSize: 14, color: '#222', borderBottom: '1px solid #f0f2f5', borderTop: '1px solid #f0f2f5' }}>
                {row.section}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #f0f2f5' }}>
              {[
                { val: row.aRed || row.aVal, isRed: !!row.aRed },
                { val: row.bRed || row.bVal, isRed: !!row.bRed },
              ].map((cell, ci) => (
                <div key={ci} style={{
                  padding: '14px 16px',
                  borderRight: ci === 0 ? '1px solid #f0f2f5' : 'none',
                }}>
                  <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>{row.label}</div>
                  <div style={{
                    fontSize: 13, color: cell.isRed ? '#dc2626' : '#333',
                    fontWeight: cell.isRed ? 700 : 400,
                    lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  }}>
                    {cell.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 고정 가입하기 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #f0f2f5',
        padding: '12px 16px 24px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {[a, b].map((fund, i) => (
            <div key={i} style={{ fontSize: 11, color: '#333', fontWeight: 600, lineHeight: 1.4 }}>{fund.shortName}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="btn-primary" onClick={() => onJoin?.(a.id)} style={{ padding: '12px', fontSize: 14 }}>가입하기</button>
          <button className="btn-primary" onClick={() => onJoin?.(b.id)} style={{ padding: '12px', fontSize: 14 }}>가입하기</button>
        </div>
      </div>
    </div>
  );
}
