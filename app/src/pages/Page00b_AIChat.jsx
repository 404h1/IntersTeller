import { useState, useRef, useEffect } from 'react';
import StatusBar from '../components/StatusBar';
import botImg from '../assets/bot.png';

export default function Page00b_AIChat({ onFundSelect, onBack }) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: (
        <>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', lineHeight: 1.4, margin: '0 0 16px 0' }}>
            김우리 고객님, 안녕하세요.<br />
            우리은행 WON AI 뱅커입니다.
          </h2>
          <p style={{ fontSize: 16, color: '#333', margin: '0 0 16px 0', fontWeight: 600 }}>
            은행 업무에 대해 궁금한 내용을 말씀해 주세요.
          </p>
        </>
      ),
      pills: ['예금적금', '대출', '우리WON뱅킹', '환전환율', '퇴직연금', '펀드']
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');

    setMessages(prev => [
      ...prev,
      { id: Date.now(), type: 'user', content: userText, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
    ]);

    setIsTyping(true);

    // Simulate thinking and then transitioning
    setTimeout(() => {
      onFundSelect();
    }, 1500);
  };

  return (
    <div className="phone-frame" style={{ background: '#f8f9fc', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>‹</button>
        <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>WON AI 뱅커와 대화중</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* Sub-header buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666', fontWeight: 600 }}>
            톡상담
          </button>
          <div style={{ width: 1, height: 12, background: '#e0e0e0' }} />
          <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666', fontWeight: 600 }}>
            상담숨기기
          </button>
          <div style={{ width: 1, height: 12, background: '#e0e0e0' }} />
          <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666', fontWeight: 600 }}>
            처음으로
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', paddingBottom: 100 }}>
        {messages.map((msg) => {
          if (msg.type === 'bot') {
            return (
              <div key={msg.id} style={{ marginBottom: 24 }}>
                <img src={botImg} alt="bot" style={{ width: 32, height: 32, borderRadius: '50%', marginBottom: 16 }} />
                
                <div>{msg.content}</div>
                
                {msg.pills && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                    {msg.pills.map(p => (
                      <button key={p} onClick={() => setInputValue(p)} style={{ background: '#e8effd', border: 'none', borderRadius: 16, padding: '8px 14px', fontSize: 14, color: '#333', fontWeight: 600 }}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                {msg.carousel && (
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 10, margin: '0 -20px', paddingLeft: 20, paddingRight: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: '24px', minWidth: 260, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0', color: '#1b64da' }}>청약<span style={{ color: '#111' }}>에 대해<br/>궁금한 내용이 있으신가요?</span></h3>
                      <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px 0' }}>생성형AI를 경험해 보세요!</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                        <div style={{ fontSize: 40 }}>🏠💰</div>
                      </div>
                      
                      <button onClick={onFundSelect} style={{ width: '100%', background: '#1b64da', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                        WON AI 뱅커와 상담하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 24 }}>
                <div style={{ background: '#fff', padding: '12px 18px', borderRadius: '20px 4px 20px 20px', fontSize: 16, color: '#1b64da', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  "{msg.content}"
                </div>
                {msg.time && <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>{msg.time}</div>}
              </div>
            );
          }
        })}

        {isTyping && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#fff', padding: '16px', borderRadius: 24, width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div className="typing-dot" style={{ width: 8, height: 8, background: '#aaa', borderRadius: '50%' }}></div>
            <div className="typing-dot" style={{ width: 8, height: 8, background: '#aaa', borderRadius: '50%', animationDelay: '0.2s' }}></div>
            <div className="typing-dot" style={{ width: 8, height: 8, background: '#aaa', borderRadius: '50%', animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #eee' }}>
        <button style={{ background: 'none', border: 'none', fontSize: 24, color: '#888' }}>+</button>
        <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 20, display: 'flex', alignItems: 'center', padding: '10px 16px' }}>
          <input 
            type="text" 
            placeholder="메시지를 입력해 주세요" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15 }}
          />
          <button onClick={handleSend} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 14L28 36" stroke="#7B838C" strokeWidth="4" strokeLinecap="round"/>
              <path d="M50 14L40 50L32 34L16 26L50 14Z" stroke="#7B838C" strokeWidth="4" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .typing-dot {
          animation: bounce 1.4s infinite ease-in-out both;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
