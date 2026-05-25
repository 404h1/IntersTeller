import { useState, useEffect } from 'react';
import StatusBar from '../components/StatusBar';
import homeBg from '../assets/home_bg.png';
import botImg from '../assets/bot.png';
import bellIcon from '../assets/bell.svg';
import menuIcon from '../assets/menu.svg';
import productIcon from '../assets/product.svg';
import assetsIcon from '../assets/assets.svg';
import homeActiveIcon from '../assets/home_active.svg';
import stocksIcon from '../assets/stocks.svg';
import benefitsIcon from '../assets/benefits.svg';

export default function Page00_Home({ onStart }) {
  const [showPopup, setShowPopup] = useState(false);

  // Show popup after a short delay (e.g., 1.5 seconds) to simulate the app opening and then prompting
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="phone-frame" style={{ background: '#f5f7f9', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 50 }}>
        <StatusBar dark />
      </div>
      
      {/* Home Screen Content */}
      <div className="scroll-content" style={{ padding: 0, paddingBottom: 80 }}>
        
        {/* Top Header / Banner Area */}
        <div style={{ 
          backgroundColor: '#bde2ff', // fallback sky color
          backgroundImage: `url(${homeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          padding: '16px 20px 40px',
          height: 360,
          position: 'relative'
        }}>
          {/* Header Icons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            {/* Toggle */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.1)', borderRadius: 20, padding: 2 }}>
              <div style={{ background: '#fff', padding: '6px 12px', borderRadius: 18, fontSize: 13, fontWeight: 700, color: '#111' }}>일반홈</div>
              <div style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600, color: '#666' }}>쉬운</div>
            </div>
            
            {/* Right Icons */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onStart}>
                <img src={botImg} alt="bot" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: -4, right: -4, width: 6, height: 6, background: '#ff3b30', borderRadius: '50%' }} />
              </div>
              <img src={bellIcon} alt="bell" style={{ width: 24, height: 24 }} />
              <img src={menuIcon} alt="menu" style={{ width: 24, height: 24 }} />
            </div>
          </div>

        </div>

        <div style={{ padding: '0 20px', background: 'transparent', minHeight: 400, marginTop: -60, position: 'relative', zIndex: 10 }}>
          {/* Card 1: Tip */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 16, right: 16, color: '#aaa', fontSize: 18 }}>✕</span>
            <div style={{ fontSize: 15, color: '#333', lineHeight: 1.4, marginBottom: 12 }}>
              홈 화면에 다른 계좌를 추가하거나<br/>계좌 순서를 변경할 수 있어요
            </div>
            <div style={{ fontSize: 14, color: '#1b64da', fontWeight: 600 }}>홈 계좌 설정 〉</div>
          </div>

          {/* Card 2: Main Account */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0ebff' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #0052cc 0%, #3388ff 100%)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>WON 통장 <span style={{ color: '#ccc', fontSize: 16 }}>⋮</span></div>
                  <div style={{ fontSize: 13, color: '#888' }}>우리</div>
                </div>
              </div>
              <span style={{ color: '#ccc', fontSize: 20 }}>⧉</span>
            </div>
            
            <div style={{ display: 'inline-block', background: '#f5f5f5', padding: '4px 8px', borderRadius: 6, fontSize: 12, color: '#666', marginBottom: 12 }}>한도제한</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>1원</div>
              <button style={{ background: '#f8f8f8', border: '1px solid #eee', padding: '10px 20px', borderRadius: 20, fontSize: 14, fontWeight: 600, color: '#333' }}>이체</button>
            </div>
          </div>

          {/* View All Accounts Button */}
          <button style={{ width: '100%', background: '#fff', border: '1px solid #eee', padding: '16px', borderRadius: 16, fontSize: 15, fontWeight: 600, color: '#333', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginBottom: 24 }}>
            전체계좌보기
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{ 
        position: 'absolute', bottom: 0, width: '100%', height: 70, background: '#fff', 
        borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        paddingBottom: 20
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#888' }}>
          <img src={productIcon} alt="product" style={{ width: 24, height: 24 }} />
          <span style={{ fontSize: 11, fontWeight: 500 }}>상품</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#888' }}>
          <img src={assetsIcon} alt="assets" style={{ width: 24, height: 24 }} />
          <span style={{ fontSize: 11, fontWeight: 500 }}>자산·소비</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#111' }}>
          <img src={homeActiveIcon} alt="home" style={{ width: 24, height: 24 }} />
          <span style={{ fontSize: 11, fontWeight: 700 }}>홈</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#888' }}>
          <img src={stocksIcon} alt="stocks" style={{ width: 24, height: 24 }} />
          <span style={{ fontSize: 11, fontWeight: 500 }}>주식</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#888' }}>
          <img src={benefitsIcon} alt="benefits" style={{ width: 24, height: 24 }} />
          <span style={{ fontSize: 11, fontWeight: 500 }}>혜택</span>
        </div>
      </div>

      {/* AI Banker Popup Modal */}
      {showPopup && (
        <div className="modal-overlay" style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: '#fff', width: '85%', borderRadius: 24, padding: '32px 24px 24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)', position: 'relative',
            animation: 'slideUpFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <button 
              onClick={() => setShowPopup(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, color: '#aaa' }}
            >✕</button>
            
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <img src={botImg} alt="bot" style={{ width: 64, height: 64, borderRadius: '50%' }} />
              </div>
              <div style={{ fontSize: 14, color: '#1b64da', fontWeight: 700, marginBottom: 8 }}>우리은행의 새로운 시도</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', lineHeight: 1.4, margin: 0 }}>
                'WON AI 뱅커'<br/>서비스를 써보실래요?
              </h2>
              <p style={{ fontSize: 14, color: '#666', marginTop: 12, lineHeight: 1.5 }}>
                복잡한 상품 가입도 AI 행원과 대화하듯<br/>쉽고 빠르게 진행할 수 있어요.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={() => setShowPopup(false)}
                style={{ flex: 1, padding: '16px 0', background: '#f0f2f5', color: '#555', borderRadius: 14, fontSize: 16, fontWeight: 700, border: 'none' }}
              >
                다음에
              </button>
              <button 
                onClick={onStart}
                style={{ flex: 1, padding: '16px 0', background: '#1b64da', color: '#fff', borderRadius: 14, fontSize: 16, fontWeight: 700, border: 'none' }}
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
