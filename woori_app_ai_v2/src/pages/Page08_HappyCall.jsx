/**
 * Page08_HappyCall.jsx — AI 음성 완전판매 검증 (해피콜)
 *
 * 흐름:
 *   1. RAG 호출 → 펀드 위험 정보 추출
 *   2. TTS로 핵심 위험 브리핑 음성 재생
 *   3. 마이크 버튼 → 고객 음성 녹음
 *   4. STT → /api/judge → PASS / FAIL
 *   5. PASS: 완전판매 확인, 동의 버튼 활성화
 *   6. FAIL: AI 재설명 + 다시 마이크 (최대 3회)
 *   7. 3회 모두 FAIL → 히든 디버그 모드 안내
 *
 * 백엔드 오프라인 fallback:
 *   - fetch 실패 시 Web Speech API STT + 키워드("네/이해/알겠") PASS 처리
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import StatusBar from '../components/StatusBar';
import { getFundById } from '../data/funds';
import botImg from '../assets/bot.png';
import { Icon } from '../components/Icons';

const API_BASE = 'http://localhost:8000';
const MAX_ATTEMPTS = 3;

// 오디오 로그 localStorage 키
const AUDIO_LOG_KEY = 'woori_happycall_log';

// 투자자 유형 → 위험 호환 여부
const HIGH_RISK_TYPES = ['공격투자형', '적극투자형'];

// ─────────────────────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────────────────────

function saveLog(entry) {
  try {
    const prev = JSON.parse(localStorage.getItem(AUDIO_LOG_KEY) || '[]');
    prev.push({ ts: new Date().toISOString(), ...entry });
    localStorage.setItem(AUDIO_LOG_KEY, JSON.stringify(prev.slice(-50)));
  } catch (_) {}
}

function formatAmount(n) {
  if (!n) return '0원';
  return n.toLocaleString() + '원';
}

// ─────────────────────────────────────────────────────────────────────────────
// 음성 파형 애니메이션
// ─────────────────────────────────────────────────────────────────────────────

function WaveformBars({ active, color = '#1b64da' }) {
  const heights = [10, 18, 14, 22, 10, 16, 8, 20, 12];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: active ? h : 4,
            background: color,
            borderRadius: 2,
            transition: 'height 0.15s ease',
            animation: active ? `waveBar 0.7s ${i * 0.08}s ease-in-out infinite alternate` : 'none',
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 시도 진행 인디케이터
// ─────────────────────────────────────────────────────────────────────────────

function AttemptDots({ current, max }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: i < current ? '#f59e0b' : i === current ? '#1b64da' : '#e2e8f0',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────────────────────────

export default function Page08_HappyCall({
  fundId = 3,
  investAmount = 0,
  investorType = '공격투자형',
  onClose,
  onDone,
}) {
  const fund = getFundById(fundId);

  // ── 상태 ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('loading'); // loading | briefing | listening | judging | pass | fail | done
  const [attempt, setAttempt] = useState(0);     // 0-based
  const [ragData, setRagData] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [failReason, setFailReason] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInput, setDebugInput] = useState('');
  const [debugVisible, setDebugVisible] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const debugHoldRef = useRef(null);
  // runJudge ref — 항상 최신 버전을 참조하도록 ref로 보관
  const runJudgeRef = useRef(null);

  // ── TTS 재생 (백엔드 → fallback: Web Speech API) ──────────────────────────
  const speak = useCallback(async (text) => {
    // 기존 재생 중단
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(true);
    saveLog({ type: 'tts_start', text: text.slice(0, 80) });

    try {
      const resp = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: 'ko' }),
        signal: AbortSignal.timeout(8000),
      });
      if (!resp.ok) throw new Error('TTS 서버 오류');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
    } catch (_) {
      // fallback: Web Speech API
      try {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'ko-KR';
        utter.rate = 0.95;
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
      } catch (__) {
        setIsSpeaking(false);
      }
    }
  }, []);

  // ── RAG 호출 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadRag() {
      try {
        const resp = await fetch(`${API_BASE}/api/rag/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fund_id: fundId, investor_type: investorType }),
          signal: AbortSignal.timeout(5000),
        });
        if (resp.ok) {
          const data = await resp.json();
          setRagData(data);
          saveLog({ type: 'rag_loaded', fund_id: fundId, investor_type: investorType });
          setPhase('briefing');
          return;
        }
      } catch (_) {}
      // 백엔드 오프라인: 기본 위험 데이터 사용
      setRagData({
        risks: [
          '원금 전액 손실이 가능한 고위험 상품입니다.',
          '예금자보호 대상이 아닙니다.',
          '투자 전 상품 위험성을 충분히 검토하시기 바랍니다.',
        ],
        summary: `${fund.shortName}은 ${fund.risk} 상품으로 원금 손실 위험이 있습니다.`,
        personalized_warning: HIGH_RISK_TYPES.includes(investorType)
          ? `${investorType} 성향으로 이 상품과 적합한 수준입니다. 단, 원금 손실 가능성은 항상 존재합니다.`
          : `[주의] ${investorType} 성향보다 이 상품의 위험등급이 높습니다. 원금 손실 가능성을 충분히 인지하시기 바랍니다.`,
      });
      setPhase('briefing');
    }
    loadRag();
  }, [fundId, investorType]);

  // ── 브리핑 음성 재생 ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'briefing' || !ragData) return;
    const script = buildBriefingScript(fund, ragData, investorType);
    setStatusMsg(script);
    speak(script);
  }, [phase, ragData]);

  // ── STT: 마이크 녹음 ──────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (isRecording) return;

    // 음성 재생 중지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        handleRecordingDone();
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setPhase('listening');
      setStatusMsg('말씀해 주세요...');
      saveLog({ type: 'recording_start', attempt });
    } catch (_) {
      // 마이크 권한 없음 → Web Speech API fallback
      webSpeechFallback();
    }
  }, [isRecording, attempt]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
  }, [isRecording]);

  // ── 녹음 완료 → STT + Judge ───────────────────────────────────────────────
  const handleRecordingDone = useCallback(async () => {
    setPhase('judging');
    setStatusMsg('음성을 분석하고 있어요...');

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    let userTranscript = '';

    // 1. STT 호출
    try {
      const fd = new FormData();
      fd.append('audio', blob, 'recording.webm');
      const sttResp = await fetch(`${API_BASE}/api/stt`, {
        method: 'POST',
        body: fd,
        signal: AbortSignal.timeout(10000),
      });
      if (sttResp.ok) {
        const sttData = await sttResp.json();
        if (sttData.transcript === '__USE_WEB_SPEECH__') {
          // faster-whisper 미설치 → 브라우저 STT로 재시도
          webSpeechFallback();
          return;
        }
        userTranscript = sttData.transcript || '';
      }
    } catch (_) {
      // STT 서버 오프라인 → 키워드 휴리스틱
    }

    setTranscript(userTranscript);
    saveLog({ type: 'stt_result', transcript: userTranscript, attempt });
    await runJudgeRef.current?.(userTranscript);
  }, [attempt, ragData, fund, investorType]);

  // ── Web Speech API fallback ────────────────────────────────────────────────
  const webSpeechFallback = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      // STT 아예 불가 → 히든 디버그 모드 진입 안내
      setDebugVisible(true);
      setPhase('fail');
      setFailReason('음성 인식을 사용할 수 없는 환경입니다.');
      setSuggestion('화면 하단의 텍스트 입력을 이용해 주세요.');
      return;
    }
    setIsRecording(true);
    setPhase('listening');
    const recog = new SR();
    recog.lang = 'ko-KR';
    recog.interimResults = false;
    recog.onresult = async (e) => {
      const t = e.results[0][0].transcript.trim();
      setIsRecording(false);
      setTranscript(t);
      setPhase('judging');
      setStatusMsg('음성을 분석하고 있어요...');
      saveLog({ type: 'web_speech_result', transcript: t, attempt });
      await runJudgeRef.current?.(t);
    };
    recog.onerror = () => {
      setIsRecording(false);
      setPhase('fail');
      setFailReason('음성 인식에 실패했습니다.');
      setSuggestion('다시 마이크 버튼을 눌러 말씀해 주세요.');
    };
    recog.onend = () => setIsRecording(false);
    recog.start();
  }, [attempt, ragData]);

  // ── Judge 호출 ────────────────────────────────────────────────────────────
  // runJudgeRef에 최신 버전을 항상 반영 (handleRecordingDone / webSpeechFallback에서 ref로 호출)
  const runJudge = useCallback(async (userTranscript) => {
    const context = ragData
      ? `${ragData.summary}\n${ragData.personalized_warning}\n핵심 위험:\n${ragData.risks.join('\n')}`
      : `${fund.shortName}은 ${fund.risk} 상품으로 원금 손실 위험이 있습니다.`;

    let result = null;

    try {
      const resp = await fetch(`${API_BASE}/api/judge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: userTranscript, context }),
        signal: AbortSignal.timeout(8000),
      });
      if (resp.ok) {
        result = await resp.json();
      }
    } catch (_) {
      // 백엔드 오프라인 → 로컬 키워드 판별
      result = localKeywordJudge(userTranscript);
    }

    if (!result) {
      result = localKeywordJudge(userTranscript);
    }

    saveLog({ type: 'judge_result', result: result.result, reason: result.reason, attempt });

    if (result.result === 'PASS') {
      setPhase('pass');
      setStatusMsg('완전판매가 확인되었습니다.');
      speak('감사합니다. 고객님의 동의가 확인되었습니다. 완전판매 검증이 완료되었습니다.');
    } else {
      const nextAttempt = attempt + 1;
      setAttempt(nextAttempt);
      setFailReason(result.reason || '명확한 동의 표현을 확인하지 못했습니다.');
      const sugg = result.suggestion || '다시 한번 "네, 이해했습니다"라고 말씀해 주시겠어요?';
      setSuggestion(sugg);

      if (nextAttempt >= MAX_ATTEMPTS) {
        setPhase('fail');
        setDebugVisible(true);
        speak(`죄송합니다. 음성으로 확인이 어려워 텍스트 입력을 이용해 주세요.`);
      } else {
        setPhase('fail');
        speak(sugg);
      }
    }
  }, [attempt, ragData, fund, speak]);

  // runJudgeRef를 항상 최신 runJudge로 갱신
  runJudgeRef.current = runJudge;

  // ── 로컬 키워드 판별 (백엔드 오프라인 fallback) ───────────────────────────
  function localKeywordJudge(text) {
    const t = (text || '').toLowerCase();
    const positive = /네|예|응|알겠|이해|동의|맞아|맞습|확인|그렇|ok|yes/.test(t);
    const negative = /모르|잘\s*모|아마|아니|거부|싫|뭐라|다시|못\s*들/.test(t);
    if (negative || !positive) {
      return {
        result: 'FAIL',
        reason: `명확한 긍정 표현이 확인되지 않았습니다: "${text}"`,
        suggestion: '상품의 위험성을 이해하셨다면 "네, 이해했습니다"라고 말씀해 주세요.',
      };
    }
    return { result: 'PASS', reason: `긍정 표현 확인: "${text}"`, suggestion: null };
  }

  // ── 히든 디버그: 텍스트 제출 ──────────────────────────────────────────────
  const handleDebugSubmit = useCallback(async () => {
    if (!debugInput.trim()) return;
    setTranscript(debugInput);
    setPhase('judging');
    setStatusMsg('텍스트를 분석하고 있어요...');
    saveLog({ type: 'debug_submit', text: debugInput, attempt });
    await runJudgeRef.current?.(debugInput);
    setDebugInput('');
  }, [debugInput]);

  // ── 히든 디버그 버튼: 3초 롱프레스 ──────────────────────────────────────
  const handleDebugMouseDown = () => {
    debugHoldRef.current = setTimeout(() => setDebugMode(true), 3000);
  };
  const handleDebugMouseUp = () => {
    clearTimeout(debugHoldRef.current);
  };

  // ── 브리핑 스크립트 생성 ──────────────────────────────────────────────────
  function buildBriefingScript(fund, rag, invType) {
    const riskNote = rag?.risks?.[0] || '원금 손실 가능성이 있는 상품입니다.';
    const warning = rag?.personalized_warning || '';
    const isHighRisk = HIGH_RISK_TYPES.includes(invType);
    const mismatchLine = !isHighRisk
      ? ` ${invType}이신 고객님의 성향과 다소 차이가 있을 수 있습니다.`
      : '';
    return (
      `고객님, ${fund.shortName}은 ${fund.risk} 상품입니다.${mismatchLine} ` +
      `${riskNote} ` +
      `예금자보호 대상이 아니며, 원금 손실 가능성을 명확히 인지하셨나요? ` +
      `이해하셨다면 '네, 이해했습니다'라고 말씀해 주세요.`
    );
  }

  // ── 단계별 상태 텍스트 ────────────────────────────────────────────────────
  function getPhaseLabel() {
    switch (phase) {
      case 'loading':   return 'AI가 상품 정보를 불러오고 있어요...';
      case 'briefing':  return isSpeaking ? 'AI가 위험 내용을 안내하고 있어요' : '안내가 끝났습니다. 마이크를 눌러 답변해 주세요.';
      case 'listening': return '듣고 있어요... 말씀해 주세요';
      case 'judging':   return '답변을 분석하고 있어요...';
      case 'pass':      return '완전판매 확인 완료';
      case 'fail':      return attempt >= MAX_ATTEMPTS ? '음성 인식 3회 실패' : `다시 확인이 필요해요 (${attempt}/${MAX_ATTEMPTS}회)`;
      case 'done':      return '완료되었습니다.';
      default:          return '';
    }
  }

  // ── 마이크 버튼 표시 여부 ─────────────────────────────────────────────────
  const showMicButton = phase === 'briefing' || phase === 'fail' || phase === 'listening';
  const micDisabled = phase === 'judging' || phase === 'pass' || phase === 'done' || (attempt >= MAX_ATTEMPTS && !debugMode);

  // ─────────────────────────────────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="phone-frame">
      <StatusBar />
      <div className="app-header">
        <h1>AI 완전판매 검증</h1>
        {phase !== 'pass' && phase !== 'done' && (
          <button
            onClick={onClose}
            style={{ position: 'absolute', right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#333' }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="scroll-content" style={{ padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── 펀드 정보 카드 ── */}
        <div style={{ background: '#f8fafc', borderRadius: 14, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#888' }}>가입 상품</span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: fund.riskClass === 'tag-red' ? '#fee2e2' : '#fef3c7',
              color: fund.riskClass === 'tag-red' ? '#dc2626' : '#d97706',
            }}>
              {fund.risk}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{fund.shortName}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#888' }}>투자자 유형</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1b64da' }}>{investorType}</span>
          </div>
          {investAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: '#888' }}>가입 금액</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{formatAmount(investAmount)}</span>
            </div>
          )}
        </div>

        {/* ── 시도 횟수 ── */}
        {attempt > 0 && phase !== 'pass' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#888' }}>확인 시도</span>
            <AttemptDots current={attempt} max={MAX_ATTEMPTS} />
            <span style={{ fontSize: 12, color: attempt >= MAX_ATTEMPTS ? '#dc2626' : '#888' }}>
              {attempt}/{MAX_ATTEMPTS}회
            </span>
          </div>
        )}

        {/* ── AI 아바타 + 파형 ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '24px 0', gap: 12,
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
            border: phase === 'pass' ? '3px solid #22c55e'
                  : phase === 'fail' ? '3px solid #f59e0b'
                  : '3px solid #1b64da',
            boxShadow: isSpeaking ? '0 0 0 6px rgba(27,100,218,0.15)' : 'none',
            transition: 'box-shadow 0.3s, border-color 0.3s',
          }}>
            <img src={botImg} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <WaveformBars
            active={isSpeaking || isRecording}
            color={isRecording ? '#ef4444' : '#1b64da'}
          />

          <div style={{
            fontSize: 13, fontWeight: 600, color:
              phase === 'pass' ? '#22c55e' :
              phase === 'fail' ? '#f59e0b' :
              '#1b64da',
            textAlign: 'center',
          }}>
            {getPhaseLabel()}
          </div>
        </div>

        {/* ── 안내 스크립트 텍스트 ── */}
        {statusMsg && (
          <div style={{
            background: '#f0f5ff', borderRadius: 14, padding: '14px 16px',
            fontSize: 14, color: '#334155', lineHeight: 1.7,
            border: '1px solid #dbeafe',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1b64da', marginBottom: 6 }}>WON AI 뱅커</div>
            {statusMsg}
          </div>
        )}

        {/* ── FAIL 상세 ── */}
        {phase === 'fail' && failReason && (
          <div style={{
            background: '#fffbeb', borderRadius: 14, padding: '14px 16px',
            border: '1px solid #fde68a',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706', marginBottom: 4 }}>
              확인 필요
            </div>
            <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>{failReason}</div>
            {transcript && (
              <div style={{ fontSize: 12, color: '#a16207', marginTop: 6 }}>
                인식된 발화: "{transcript}"
              </div>
            )}
          </div>
        )}

        {/* ── PASS 완료 카드 ── */}
        {phase === 'pass' && (
          <div style={{
            background: '#f0fdf4', borderRadius: 14, padding: '20px 16px',
            border: '1px solid #bbf7d0', textAlign: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, color: '#fff', margin: '0 auto 12px',
            }}>
              ✓
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginBottom: 6 }}>
              완전판매가 확인되었습니다
            </div>
            <div style={{ fontSize: 13, color: '#166534' }}>
              고객님의 음성 동의가 성공적으로 기록되었습니다.
            </div>
          </div>
        )}

        {/* ── 히든 디버그: 텍스트 입력 ── */}
        {(debugMode || debugVisible) && phase !== 'pass' && (
          <div style={{
            background: '#f8fafc', borderRadius: 14, padding: '16px',
            border: '2px dashed #94a3b8',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 10 }}>
              디버그 모드 — 텍스트로 제출
            </div>
            <input
              type="text"
              value={debugInput}
              onChange={e => setDebugInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleDebugSubmit(); }}
              placeholder='"네, 이해했습니다"를 입력하세요'
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1',
                fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 10,
              }}
            />
            <button
              onClick={handleDebugSubmit}
              disabled={!debugInput.trim() || phase === 'judging'}
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                background: debugInput.trim() ? '#1b64da' : '#c0cfe8',
                color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
                cursor: debugInput.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              텍스트로 제출
            </button>
          </div>
        )}

      </div>

      {/* ── 하단 마이크 버튼 ── */}
      {!agreed && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: '#fff', padding: '16px 20px 28px',
          boxShadow: '0 -2px 16px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center',
        }}>
          {/* 마이크 버튼 */}
          {showMicButton && !micDisabled && (
            <button
              onMouseDown={isRecording ? stopRecording : startRecording}
              onTouchStart={e => { e.preventDefault(); isRecording ? stopRecording() : startRecording(); }}
              disabled={phase === 'judging'}
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: isRecording ? '#ef4444' : '#1b64da',
                border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
                boxShadow: isRecording
                  ? '0 0 0 8px rgba(239,68,68,0.2)'
                  : '0 4px 16px rgba(27,100,218,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {isRecording ? <Icon name="stop" size={22} color="#fff" /> : <Icon name="mic" size={22} color="#fff" />}
            </button>
          )}

          {/* 상태 텍스트 */}
          <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>
            {isRecording
              ? '버튼을 다시 누르면 녹음이 종료됩니다'
              : phase === 'briefing' || phase === 'fail'
                ? '마이크를 눌러 답변해 주세요'
                : phase === 'judging'
                  ? '분석 중...'
                  : ''}
          </div>

          {/* 동의 완료 버튼 (PASS 시 파란색 활성화) */}
          {phase === 'pass' && (
            <button
              className="btn-primary"
              onClick={() => { setAgreed(true); onDone?.(); }}
              style={{ width: '100%', background: '#1b64da' }}
            >
              동의 완료 — 해피콜 등록
            </button>
          )}
        </div>
      )}

      {/* ── 히든 디버그 트리거 버튼 (우하단 5×5px 투명) ── */}
      <button
        onMouseDown={handleDebugMouseDown}
        onMouseUp={handleDebugMouseUp}
        onTouchStart={handleDebugMouseDown}
        onTouchEnd={handleDebugMouseUp}
        style={{
          position: 'absolute', bottom: 4, right: 4,
          width: 5, height: 5, background: 'transparent', border: 'none',
          cursor: 'default', padding: 0, zIndex: 9999,
        }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
