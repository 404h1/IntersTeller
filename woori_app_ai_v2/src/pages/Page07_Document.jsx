import { useState, useRef } from 'react';
import StatusBar from '../components/StatusBar';
import VoiceGuide from '../components/VoiceGuide';
import { Icon } from '../components/Icons';

const SCRIPT = '상품설명서예요. 원금 손실 가능성, 환매 조건, 청약철회가 가능한 기간이 적혀 있어요. 끝까지 직접 읽어보셔야 가입이 진행돼요. 시간이 걸려도 천천히 보시고, 이해 안 되는 부분은 상담을 요청하세요.';
const AUDIO  = `${import.meta.env.BASE_URL}audio/page07.mp3`;

export default function Page07_Document({ onClose, onNext }) {
  const [scrolled, setScrolled] = useState(false);
  const [showVoice, setShowVoice] = useState(true);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (atBottom) setScrolled(true);
  };

  return (
    <div className="phone-frame">
      <StatusBar />
      <div className="app-header">
        <h1>집합투자상품설명서 확인</h1>
        <button onClick={onClose} style={{ position: 'absolute', right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#333' }}>✕</button>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scroll-content"
        style={{ padding: '20px 20px 100px' }}
      >
        {/* 준법 배지 */}
        <div style={{ background: '#f2f4f6', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
          준법감시인 심의필 2025-12047<br />(2025.12.02~2027.12.31)
        </div>

        <div style={{ marginBottom: 12 }}>
          <span className="tag tag-pink" style={{ marginBottom: 12, display: 'inline-block' }}>원금손실가능상품</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#111', lineHeight: 1.35, marginBottom: 20 }}>
          (비고난도) 공모형 집합투자증권<br />상품설명서
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px', marginBottom: 20, fontSize: 13, color: '#555', lineHeight: 1.7 }}>
          ※ 본 서류는 관련법령 및 내부통제기준에 따른 절차를 거쳐 작성되었습니다.
        </div>

        <p style={{ fontSize: 14, color: '#333', lineHeight: 1.8, marginBottom: 20 }}>
          본 설명서는 고객님께서 가입하신 집합투자증권의 투자설명서, 간이투자설명서 외 판매사가 고객님께 안내해야하는 정보를 담고 있습니다. 따라서, 투자상품에 대한 정보가 필요하신 경우에는 교부 받으신 투자설명서, 간이투자설명서를 반드시 참고하시기 바랍니다. 본 상품은 일반 예금상품과 달리 <span style={{ color: '#dc2626', fontWeight: 600 }}>원금의 일부 또는 전부 손실이 발생할 수 있으며</span>, 투자로 인한 손실은 투자자 본인에게 귀속됩니다.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ background: '#dc2626', borderRadius: 6, padding: '4px 6px', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, textAlign: 'center', lineHeight: 1.4 }}>
            예금보험공사<br />비보호
          </div>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>이 금융상품은 예금자보호법에 따라 보호되지 않습니다.</p>
        </div>

        {/* 주의사항 */}
        <div style={{ background: '#fff5f5', borderRadius: 12, padding: '16px', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <Icon name="warning" size={16} color="#dc2626" />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#dc2626' }}>주의사항</span>
          </div>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
            설명을 제대로 이해하지 못한 상태에서 설명을 이해했다는 서명을 하거나 녹취기록을 남길 경우 추후 권리구제가 어려울 수 있습니다.
          </p>
        </div>

        {/* 1. 상품 기본 정보 */}
        <SectionHeader num="1" title="상품 기본 정보" />
        <DocTable rows={[
          ['상품유형', '집합투자증권 (공모형 증권자투자신탁)'],
          ['투자대상', '국내·해외 주식 (반도체·IT 섹터 집중)'],
          ['위험등급', '1등급 (매우 높은 위험)'],
          ['예금자보호', '비보호'],
          ['모집기간', '상시모집'],
          ['최저가입금액', '10,000원 이상 1원 단위'],
        ]} />

        {/* 2. 수수료 및 보수 */}
        <SectionHeader num="2" title="수수료 및 보수" />
        <DocTable rows={[
          ['선취판매수수료', '투자금액의 0.5%'],
          ['집합투자업자보수', '연 0.65%'],
          ['판매회사보수', '연 0.50%'],
          ['수탁회사보수', '연 0.05%'],
          ['일반사무관리회사보수', '연 0.06%'],
          ['총보수·비용 합계', '연 1.26% (예상)'],
          ['환매수수료', '3개월 미만 환매 시 환매대금의 이익금 70%'],
        ]} />

        {/* 3. 원금 손실 가능성 */}
        <SectionHeader num="3" title="원금 손실 가능성" />
        <DocParagraph>
          본 펀드는 <Red>주식 등 위험자산</Red>에 투자하므로, 시장 상황에 따라 <Red>투자원금의 일부 또는 전부</Red>를 잃을 수 있습니다.
          특히 본 펀드의 기초자산인 글로벌 반도체 산업은 경기 사이클에 민감하며, 과거 1년 이내 <Red>최대 -34%의 손실</Red>을 기록한 사례가 있습니다.
          예상 손실 시나리오는 다음과 같습니다.
        </DocParagraph>
        <DocTable rows={[
          ['낙관적 시나리오 (12개월)', '+30% ~ +50%'],
          ['중립 시나리오 (12개월)', '-10% ~ +20%'],
          ['비관적 시나리오 (12개월)', '-30% ~ -50%'],
          ['최악 시나리오 (12개월)', '-50% 이상'],
        ]} />

        {/* 4. 환매 절차 */}
        <SectionHeader num="4" title="환매 절차 및 기간" />
        <DocParagraph>
          환매 신청 시 <strong>3영업일(T+3)</strong> 후 환매대금이 지급됩니다. 단, 해외 자산이 포함된 경우 <strong>최대 7영업일(T+7)</strong>까지 소요될 수 있습니다.
          기준가는 환매 신청일 익영업일(T+1) 기준가가 적용됩니다.
        </DocParagraph>

        {/* 5. 숙려·청약철회 */}
        <SectionHeader num="5" title="숙려제도 및 청약철회권" />
        <ul style={{ paddingLeft: 18, margin: '0 0 20px 0', fontSize: 13, color: '#555', lineHeight: 1.8 }}>
          <li><strong>숙려기간:</strong> 신규 신청일 다음 영업일부터 2영업일</li>
          <li><strong>청약의사 확인:</strong> 숙려기간 종료 후 1영업일 내 진행</li>
          <li><strong>청약철회 가능 기간:</strong> 청약의사 확인일 다음일부터 7일</li>
          <li><strong>청약철회 방법:</strong> 영업점 방문 신청서 작성 또는 우리WON뱅킹</li>
          <li><strong>대상자:</strong> 일반금융소비자 중 모집기간이 있는 고난도 금융투자상품 가입자에 한함</li>
        </ul>

        {/* 6. 위법계약해지권 */}
        <SectionHeader num="6" title="위법계약해지권 안내" />
        <DocParagraph>
          금융소비자보호법 제47조에 따라, 판매회사가 <Red>적합성·적정성·설명·불공정영업행위·부당권유 금지 의무</Red> 중 어느 하나라도 위반한 경우,
          위반 사실을 안 날부터 <strong>1년 이내</strong> 또는 계약 체결일부터 <strong>5년 이내</strong>에 계약 해지를 요구하실 수 있습니다.
        </DocParagraph>

        {/* 7. 분쟁조정·민원 안내 */}
        <SectionHeader num="7" title="분쟁조정 및 민원 안내" />
        <DocTable rows={[
          ['우리은행 소비자보호부', '02-3701-6974 (영업일 09:00-18:00)'],
          ['우리은행 고객센터', '1599-0800'],
          ['금융감독원 분쟁조정', '1332'],
          ['한국소비자원', '1372'],
        ]} />

        {/* 8. 부적합 안내 */}
        <div style={{ background: '#fff5f5', borderRadius: 12, padding: '14px 16px', marginTop: 20, marginBottom: 16, border: '1px solid #fecaca' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Icon name="warning" size={14} color="#dc2626" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>부적합 가입 안내</span>
          </div>
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.7 }}>
            본 상품이 고객님의 투자성향에 적합하지 않을 경우, <strong>「적합성 미충족 확인서」</strong>를 작성한 후에만 가입이 가능합니다.
            가입 후 부적합 사유로 발생한 손실은 원칙적으로 투자자 본인에게 귀속됩니다.
          </p>
        </div>

        {/* 9. 마지막 확인 문구 */}
        <div style={{ marginTop: 24, padding: '16px', background: '#f8fafc', borderRadius: 10, fontSize: 12, color: '#666', lineHeight: 1.7 }}>
          본 설명서를 끝까지 읽고 충분히 이해하셨다면, 아래 '확인' 버튼을 눌러주세요.
          이해되지 않는 부분이 있으면 반드시 우리은행 콜센터(1599-0800) 또는 영업점 상담을 요청하시기 바랍니다.
        </div>
      </div>

      {/* 하단 */}
      <div style={{ padding: '12px 20px 24px', background: '#fff', flexShrink: 0 }}>
        {!scrolled && (
          <div style={{
            background: '#333', color: '#fff', borderRadius: 10,
            padding: '12px 16px', fontSize: 13, textAlign: 'center',
            marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name="warning" size={14} color="#fff" /> 내용을 끝까지 확인해 주세요.
          </div>
        )}
        <button className="btn-primary" onClick={onNext} disabled={!scrolled} style={!scrolled ? { background: '#c0cfe8' } : {}}>
          확인
        </button>
      </div>

      {!scrolled && (
        <div style={{
          position: 'absolute', right: 16, bottom: 160,
          background: 'rgba(0,0,0,0.7)', color: '#fff',
          padding: '8px 12px', borderRadius: 20,
          fontSize: 12, fontWeight: 600,
          animation: 'fadeIn 0.3s ease-out',
        }}>
          ↓ 끝까지 읽으세요
        </div>
      )}

      {!showVoice && (
        <button className="voice-fab" style={{ bottom: 100 }} onClick={() => setShowVoice(true)}><Icon name="volume" size={24} color="#fff" /></button>
      )}
      {showVoice && (
        <VoiceGuide
          script={SCRIPT}
          audio={AUDIO}
          onClose={() => setShowVoice(false)}
          onCommand={() => {}}
        />
      )}
    </div>
  );
}

// ── 헬퍼 컴포넌트 ───────────────────────────────────────
function SectionHeader({ num, title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginTop: 20, marginBottom: 12,
      paddingTop: 16, borderTop: '1px solid #f0f2f5',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: '#1b64da', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700,
      }}>{num}</div>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{title}</span>
    </div>
  );
}

function DocTable({ rows }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '4px 14px', marginBottom: 12 }}>
      {rows.map(([label, value], i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '10px 0',
          borderBottom: i < rows.length - 1 ? '1px solid #eef0f3' : 'none',
          gap: 12,
        }}>
          <span style={{ fontSize: 12, color: '#666', flexShrink: 0 }}>{label}</span>
          <span style={{ fontSize: 12, color: '#111', fontWeight: 600, textAlign: 'right' }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function DocParagraph({ children }) {
  return (
    <p style={{ fontSize: 13, color: '#444', lineHeight: 1.8, marginBottom: 12 }}>{children}</p>
  );
}

function Red({ children }) {
  return <span style={{ color: '#dc2626', fontWeight: 600 }}>{children}</span>;
}
