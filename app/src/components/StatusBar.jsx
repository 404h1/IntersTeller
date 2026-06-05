export default function StatusBar({ dark }) {
  return (
    <div className="status-bar" style={dark ? { background: 'transparent' } : {}}>
      <span className="time" style={dark ? { color: '#111' } : {}}>1:41</span>
      <span className="icons" style={dark ? { color: '#111' } : {}}>▪▪▪ 5G 🔋</span>
    </div>
  );
}
