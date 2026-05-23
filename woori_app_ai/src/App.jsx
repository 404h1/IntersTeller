import { useState } from 'react';
import './index.css';

import Page00 from './pages/Page00_Home';
import Page00b from './pages/Page00b_AIChat';
import Page01 from './pages/Page01_InvestorInfo';
import Page02 from './pages/Page02_InvestmentResult';
import Page03 from './pages/Page03_FundList';
import Page03b from './pages/Page03b_FundDetail';
import Page03c from './pages/Page03c_FundAI';
import Page04 from './pages/Page04_FundCompare';
import Page05 from './pages/Page05_InvestorCheck';
import Page06 from './pages/Page06_FundJoin';
import Page07 from './pages/Page07_Document';
import Page08 from './pages/Page08_HappyCall';
import consultingImg from './assets/consulting.png';

// 화면 순서
// 00(홈/팝업) → 00b(AI챗봇) → 01(설문) → 02(결과) → 03(목록) → 03b(상세) 또는 04(비교) → 05(투자자확인) → 06(가입) → 07(설명서) → 08(해피콜)

export default function App() {
  const [page, setPage] = useState('00');
  const [isConsulting, setIsConsulting] = useState(false);

  const go = (p) => setPage(p);

  return (
    <div style={{ position: 'relative', width: 390, height: 844, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      {page === '00' && <Page00 onStart={() => go('00b')} />}
      {page === '00b' && (
        <Page00b 
          onFundSelect={() => { setIsConsulting(true); go('01'); }} 
          onBack={() => go('00')} 
        />
      )}
      {page === '01' && <Page01 onNext={() => go('02')} />}
      {page === '02' && <Page02 onNext={() => go('03')} onBack={() => go('01')} />}
      {page === '03' && (
        <Page03
          onNext={() => go('04')}
          onFundDetail={() => go('03b')}
          onBack={() => go('02')}
        />
      )}
      {page === '03b' && (
        <Page03b
          onBack={() => go('03')}
          onAI={() => go('03c')}
          onJoin={() => go('05')}
        />
      )}
      {page === '03c' && (
        <Page03c
          onBack={() => go('03b')}
          onJoin={() => go('05')}
        />
      )}
      {page === '04' && (
        <Page04
          onBack={() => go('03')}
          onJoin={() => go('05')}
        />
      )}
      {page === '05' && (
        <Page05
          onClose={() => go('06')}
        />
      )}
      {page === '06' && (
        <Page06
          onBack={() => go('05')}
          onNext={() => go('07')}
        />
      )}
      {page === '07' && (
        <Page07
          onClose={() => go('06')}
          onNext={() => go('08')}
        />
      )}
      {page === '08' && (
        <Page08
          onClose={() => go('06')}
          onDone={() => go('01')}
        />
      )}

      {/* Floating Consulting Badge */}
      {isConsulting && page !== '00' && page !== '00b' && (
        <div className="floating-consult-badge" style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          zIndex: 9999,
          animation: 'slideUpFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsConsulting(false)}
              style={{
                position: 'absolute', top: -6, left: -6, background: '#fff', border: '1px solid #ccc',
                borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: '#666', cursor: 'pointer', zIndex: 10
              }}
            >×</button>
            <img src={consultingImg} alt="상담중" style={{ width: 80, height: 'auto', dropShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          </div>
        </div>
      )}
    </div>
  );
}

