import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

const VoiceCtx = createContext(null);

// mp3 존재 여부 캐시 — 같은 URL을 두 번 HEAD 안 함
const mp3ExistsCache = new Map();

async function mp3Exists(url) {
  if (mp3ExistsCache.has(url)) return mp3ExistsCache.get(url);
  try {
    const r = await fetch(url, { method: 'HEAD' });
    const ok = r.ok;
    mp3ExistsCache.set(url, ok);
    return ok;
  } catch {
    mp3ExistsCache.set(url, false);
    return false;
  }
}

export function VoiceProvider({ children }) {
  const [isPlaying, setIsPlaying]         = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [currentScript, setCurrentScript] = useState('');
  const [currentAudio, setCurrentAudio]   = useState(null);

  const audioRef       = useRef(null);
  const intervalRef    = useRef(null);
  const fallbackFiredRef = useRef(false);

  const clearInterval_ = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.onerror = null;
      audioRef.current.onended = null;
      audioRef.current.onplay = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    clearInterval_();
  };

  const stopTTS = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  // 비상용 Web Speech API — 정적 mp3가 없을 때만
  const speakTTS = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setCurrentScript(text);
    setCurrentAudio(null);
    setActiveWordIdx(-1);

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang   = 'ko-KR';
    utt.rate   = 0.9;
    utt.pitch  = 1.05;
    utt.volume = 1.0;

    const getKoVoice = () => {
      const voices = window.speechSynthesis?.getVoices() ?? [];
      return voices.find(v => v.lang === 'ko-KR' || v.lang === 'ko_KR') ?? null;
    };

    const doSpeak = () => {
      const v = getKoVoice();
      if (v) utt.voice = v;
      window.speechSynthesis.speak(utt);
    };

    utt.onboundary = (e) => {
      if (e.name !== 'word') return;
      const idx = text.slice(0, e.charIndex).split(/\s+/).filter(Boolean).length;
      setActiveWordIdx(idx);
    };
    utt.onstart = () => setIsPlaying(true);
    utt.onend   = () => { setIsPlaying(false); setActiveWordIdx(-1); };
    utt.onerror = () => { setIsPlaying(false); setActiveWordIdx(-1); };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = doSpeak;
    } else {
      doSpeak();
    }
  }, []);

  // 정적 mp3 재생 + 단어 하이라이트
  const speakAudio = useCallback(async (text, audioUrl) => {
    stopAudio();
    stopTTS();
    fallbackFiredRef.current = false;

    const fallbackOnce = (reason) => {
      if (fallbackFiredRef.current) return;
      fallbackFiredRef.current = true;
      console.warn('[VoiceContext] mp3 fallback to TTS:', reason);
      clearInterval_();
      if (audioRef.current) {
        audioRef.current.onerror = null;
        audioRef.current.onended = null;
        audioRef.current.onplay = null;
        audioRef.current.onloadedmetadata = null;
        audioRef.current = null;
      }
      speakTTS(text);
    };

    const words = text.split(/\s+/).filter(Boolean);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    setCurrentScript(text);
    setCurrentAudio(audioUrl);
    setActiveWordIdx(-1);

    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      if (!isFinite(duration) || duration <= 0) return;
      const perWordMs = (duration * 1000) / words.length;
      let idx = -1;
      intervalRef.current = setInterval(() => {
        idx += 1;
        if (idx >= words.length) {
          clearInterval_();
          return;
        }
        setActiveWordIdx(idx);
      }, perWordMs);
    };

    audio.onplay  = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      setActiveWordIdx(-1);
      clearInterval_();
    };
    audio.onerror = () => fallbackOnce('audio.onerror');

    try {
      await audio.play();
    } catch (e) {
      fallbackOnce(`play() rejected: ${e?.name || e}`);
    }
  }, [speakTTS]);

  // 통합 API — audioUrl 있으면 정적 mp3 시도, 없으면 Web Speech
  const speak = useCallback((text, audioUrl) => {
    if (audioUrl) speakAudio(text, audioUrl);
    else          speakTTS(text);
  }, [speakAudio, speakTTS]);

  const stop = useCallback(() => {
    stopAudio();
    stopTTS();
    setIsPlaying(false);
    setActiveWordIdx(-1);
  }, []);

  const replay = useCallback(() => {
    if (currentScript) speak(currentScript, currentAudio);
  }, [currentScript, currentAudio, speak]);

  useEffect(() => () => { stopAudio(); stopTTS(); }, []);

  return (
    <VoiceCtx.Provider value={{ isPlaying, activeWordIdx, currentScript, speak, stop, replay }}>
      {children}
    </VoiceCtx.Provider>
  );
}

export const useVoice = () => useContext(VoiceCtx);
