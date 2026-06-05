import { Icon } from './Icons';

export default function ConsultSheet({ onClose }) {
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="bottom-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111', lineHeight: 1.4 }}>
              궁금한 점이 있으신가요?<br />
              전문 상담직원이 도와드릴게요.
            </div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>영업일 09:00 ~ 18:00</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#333', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <button style={consultBtnStyle}>
            <div style={consultIconCircle('#1b64da')}><Icon name="volume" size={20} color="#fff" /></div>
            <span style={{ fontSize: 13, color: '#333', marginTop: 8 }}>전화 상담</span>
          </button>
          <button style={consultBtnStyle}>
            <div style={consultIconCircle('#1b64da')}><Icon name="record" size={20} color="#fff" /></div>
            <span style={{ fontSize: 13, color: '#333', marginTop: 8 }}>영상 상담</span>
          </button>
        </div>
        <button style={{ ...consultBtnStyle, width: '100%', flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
          <div style={consultIconCircle('#4ade80')}><Icon name="chat" size={20} color="#fff" /></div>
          <span style={{ fontSize: 13, color: '#333' }}>채팅 상담</span>
        </button>
      </div>
    </>
  );
}

const consultBtnStyle = {
  background: '#f8fafc',
  border: '1px solid #f0f2f5',
  borderRadius: 12,
  padding: '16px 12px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

function consultIconCircle(color) {
  return {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  };
}
