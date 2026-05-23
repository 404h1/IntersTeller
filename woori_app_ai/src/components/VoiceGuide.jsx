import { useState, useEffect, useRef } from 'react';
import { useVoice } from '../context/VoiceContext';
import botImg from '../assets/bot.png';

export default function VoiceGuide({ script, onClose, onCommand, autoPlay = true }) {
  const { isPlaying, activeWordIdx, currentScript, speak, stop, replay } = useVoice();
  const [isListening, setIsListening] = useState(false);
  const [closing, setClosing]         = useState(false);
  const recognRef  = useRef(null);
  const textBoxRef = useRef(null);

  const words        = script.replace(/\n/g, ' ').split(/\s+/).filter(Boolean);
  const thisIsActive  = currentScript === script;
  const thisIsPlaying = thisIsActive && isPlaying;

  useEffect(() => {
    if (!autoPlay) return;
    if (thisIsActive && isPlaying) return;
    const t = setTimeout(() => speak(script), 450);
    return () => clearTimeout(t);
  }, [script]);

  useEffect(() => {
    if (!thisIsActive || activeWordIdx < 0 || !textBoxRef.current) return;
    textBoxRef.current.querySelectorAll('[data-word]')[activeWordIdx]
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeWordIdx, thisIsActive]);

  useEffect(() => {
    document.body.classList.add('hide-floating-badge');
    return () => {
      document.body.classList.remove('hide-floating-badge');
    };
  }, []);

  const handleClose = () => {
    recognRef.current?.stop();
    setClosing(true);
    setTimeout(() => onClose(), 280);
  };

  const handleListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (isListening) { recognRef.current?.stop(); setIsListening(false); return; }
    stop();
    if (!SR) {
      setIsListening(true);
      setTimeout(() => { setIsListening(false); onCommand?.('예'); }, 2500);
      return;
    }
    const recog = new SR();
    recog.lang = 'ko-KR';
    recog.interimResults = false;
    recog.onstart  = () => setIsListening(true);
    recog.onend    = () => setIsListening(false);
    recog.onerror  = () => setIsListening(false);
    recog.onresult = (e) => onCommand?.(e.results[0][0].transcript.trim());
    recognRef.current = recog;
    recog.start();
  };

  return (
    <div
      className={closing ? 'voice-guide-exit' : 'voice-guide-enter'}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '20px 20px 0 0', padding: '12px 20px 32px',
        zIndex: 300, boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
      }}
    >
      <div onClick={handleClose} style={{ width: 36, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 14px', cursor: 'pointer' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
          <img src={botImg} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1b64da', marginBottom: 1 }}>내 편인 AI</div>
          <div style={{ fontSize: 11, color: '#aaa' }}>
            {isListening     ? '🔴 듣고 있어요...'
             : thisIsPlaying ? '🔵 음성 안내 중...'
             : '닫아도 음성 이어져요 — 🔊 로 다시 열기'}
          </div>
        </div>
        {thisIsPlaying && (
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 20 }}>
            {[14,20,16,8].map((h, i) => (
              <div key={i} style={{ width: 3, background: '#1b64da', borderRadius: 2, height: h, animation: `vgBar${i+1} 0.8s ${i*0.12}s ease infinite alternate` }} />
            ))}
          </div>
        )}
        {isListening && (
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ff3b30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎙</div>
        )}
        <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#aaa', cursor: 'pointer', padding: 4 }}>✕</button>
      </div>

      <div ref={textBoxRef} style={{ background: '#f8fafc', borderRadius: 14, padding: '14px 16px', marginBottom: 14, minHeight: 76, maxHeight: 110, overflowY: 'auto', lineHeight: 1.8 }}>
        <span style={{ fontSize: 14 }}>
          {words.map((w, i) => (
            <span key={i} data-word={i} style={{
              color: !thisIsActive || activeWordIdx < 0 ? '#222'
                : i === activeWordIdx ? '#1b64da'
                : i < activeWordIdx  ? '#222' : '#bbb',
              fontWeight: thisIsActive && i === activeWordIdx ? 700 : 400,
              transition: 'color 0.1s',
            }}>
              {w}{' '}
            </span>
          ))}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleListen} style={{ flex: 1, padding: '12px', background: isListening ? '#ff3b30' : '#f2f4f6', color: isListening ? '#fff' : '#444', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          🎙 {isListening ? '듣는 중...' : '질문하기'}
        </button>
        <button onClick={replay} style={{ flex: 1, padding: '12px', background: '#f2f4f6', color: '#444', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          🔁 다시듣기
        </button>
      </div>

      <style>{`
        @keyframes vgBar1{from{height:4px}to{height:14px}}
        @keyframes vgBar2{from{height:4px}to{height:20px}}
        @keyframes vgBar3{from{height:4px}to{height:16px}}
        @keyframes vgBar4{from{height:4px}to{height:8px}}
      `}</style>
    </div>
  );
}
