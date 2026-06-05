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

// 00(홈/팝업) → 00b(AI챗봇) → 01(설문) → 02(결과) → 03(목록)
// → 03b(상세) → 03c(AI설명) → 04(비교) → 05(투자자확인)
// → 06(가입금액) → 07(설명서) → 08(해피콜)

export default function App() {
  const [page, setPage] = useState('00');
  const [isConsulting, setIsConsulting] = useState(false);

  // 사용자 선택 상태
  const [investorType, setInvestorType] = useState('공격투자형'); // Page01 설문 결과
  const [selectedFundId, setSelectedFundId] = useState(3);        // Page03b/c/06용 — 기본 삼성글로벌반도체
  const [compareFundIds, setCompareFundIds] = useState([]);       // Page04용 [id1, id2]
  const [investAmount, setInvestAmount] = useState(0);            // Page06 → Page07/08

  const go = (p) => setPage(p);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {page === '00' && <Page00 onStart={() => go('00b')} />}
      {page === '00b' && (
        <Page00b
          onFundSelect={() => { setIsConsulting(true); go('01'); }}
          onBack={() => go('00')}
        />
      )}
      {page === '01' && (
        <Page01
          onNext={(type) => { if (type) setInvestorType(type); go('02'); }}
          onClose={() => go('00')}
        />
      )}
      {page === '02' && (
        <Page02
          investorType={investorType}
          onNext={() => go('03')}
          onBack={() => go('01')}
        />
      )}
      {page === '03' && (
        <Page03
          investorType={investorType}
          onFundDetail={(id) => { setSelectedFundId(id); go('03b'); }}
          onCompare={(ids) => { setCompareFundIds(ids); go('04'); }}
          onBack={() => go('02')}
        />
      )}
      {page === '03b' && (
        <Page03b
          fundId={selectedFundId}
          onBack={() => go('03')}
          onAI={() => go('03c')}
          onJoin={() => go('05')}
        />
      )}
      {page === '03c' && (
        <Page03c
          fundId={selectedFundId}
          onBack={() => go('03b')}
          onJoin={() => go('05')}
        />
      )}
      {page === '04' && (
        <Page04
          fundIds={compareFundIds}
          onBack={() => go('03')}
          onJoin={(id) => { setSelectedFundId(id); go('05'); }}
        />
      )}
      {page === '05' && (
        <Page05
          onClose={() => go('06')}
        />
      )}
      {page === '06' && (
        <Page06
          fundId={selectedFundId}
          onBack={() => go('05')}
          onNext={(amount) => { if (amount) setInvestAmount(amount); go('07'); }}
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
          fundId={selectedFundId}
          investAmount={investAmount}
          investorType={investorType}
          onClose={() => go('06')}
          onDone={() => go('01')}
        />
      )}

    </div>
  );
}
