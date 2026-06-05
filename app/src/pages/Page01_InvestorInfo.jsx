import { useState, useEffect, useRef } from 'react';
import StatusBar from '../components/StatusBar';
import VoiceGuide from '../components/VoiceGuide';
import { Icon } from '../components/Icons';
import { calculateInvestorType } from '../data/investorScore';

import botImg from '../assets/bot.png';

const SCRIPT = '김우리 고객님, 안녕하세요. 우리은행 WON AI 뱅커입니다.';
const AUDIO  = `${import.meta.env.BASE_URL}audio/page01.mp3`;

// 전문금융소비자 질문 시 AI 답변 스크립트 (음성 파일 page01_pro.mp3)
const SCRIPT_PRO = '전문금융소비자는 증권사로부터 공식 확인을 받은, 금융 지식과 경험이 풍부하다고 인정된 고객을 말해요. 은행이나 증권사 같은 금융회사 종사자나 상장된 대기업이 해당돼요. 김우리 고객님은 일반금융소비자에 해당하시니까 아니오를 선택하시면 됩니다.';
const AUDIO_PRO = `${import.meta.env.BASE_URL}audio/page01_pro.mp3`;

const WibeeBotIcon = () => (
  <img src={botImg} alt="bot" style={{ width: 44, height: 44, borderRadius: '50%', marginBottom: 10, flexShrink: 0 }} />
);

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6, color: '#1b64da' }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
  </svg>
);

const CheckIcon = ({ color = '#8E94A0' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const QUESTIONS = [
  {
    id: 1,
    title: "고객님의 금융투자상품에 대한 이해도는 어느 정도인가요?",
    options: [
      "투자상품 설명서를 읽고 스스로 상품의 특징과 위험을 이해함",
      "투자상품 설명을 들으면 특징과 위험을 이해함",
      "예금과 펀드의 차이점을 알고 구별할 수 있음",
      "투자상품에 대해 스스로 결정을 해 본적이 없음"
    ]
  },
  {
    id: 2,
    title: "고객님의 수입원을 가장 잘 나타내는 것은 어느 것인가요?",
    options: [
      "현재 일정한 수입이 있고, 향후 유지 또는 증가 예상",
      "현재 일정한 수입이 발생하나 향후 불안정 또는 감소 예상",
      "현재 일정한 수입이 없거나, 연금이 주 수입원임"
    ]
  },
  {
    id: 3,
    title: "고객님의 연간 소득은 어떻게 되시나요?",
    options: [
      "2천만원 이하",
      "5천만원 이하",
      "1억원 이하",
      "1억원 초과"
    ]
  },
  {
    id: 4,
    title: "고객님이 주로 투자한 금융상품은 어느 것인가요?",
    options: [
      "주식형펀드, 파생상품펀드, 주식, ELW, 선물옵션 등",
      "인덱스 주식형펀드, 원금 비보존 ELS(DLS), 신용도 낮은 회사채 등",
      "혼합형펀드, 원금 일부 보존추구 ELS(DLS), 신용도 중간등급 회사채 등",
      "채권형 펀드, 원금 보존추구 ELB(DLB), 금융채, 신용도 높은 회사채 등",
      "은행 예적금, 국채, 지방채, 보증채, MMF, CMA 등"
    ]
  },
  {
    id: 5,
    title: "고객님의 총 자산 대비 투자 상품의 비중은 어떻게 되시나요?",
    options: [
      "10% 이하",
      "15% 이하",
      "20% 이하",
      "25% 이하",
      "25% 초과"
    ]
  },
  {
    id: 6,
    title: "고객님이 일반적으로 금융투자상품에 가입하는 주요 목적은 무엇인가요?",
    options: [
      "자산증식(여유자금 투자)",
      "목적자금 마련(결혼, 교육, 노후자금 등)",
      "퇴직금 운용"
    ]
  },
  {
    id: 7,
    title: "고객님이 감내할 수 있는 손실수준은 어느 정도인가요?",
    options: [
      "기대수익이 높다면 위험이 높아도 상관하지 않음",
      "투자원금 중 일부의 손실을 감수할 수 있음",
      "투자원금에서 최소한의 손실만 감수할 수 있음",
      "무슨 일이 있어도 투자원금은 보존되어야 함"
    ]
  },
  {
    id: 8,
    title: "고객님의 파생상품, 파생결합증권, 파생상품 투자펀드에 투자한 기간은 어떻게 되시나요?",
    options: [
      "3년 초과",
      "3년 이하",
      "1년 이하",
      "투자 경험 없음"
    ]
  },
  {
    id: 9,
    title: "현재 투자하려는 자금의 투자목적은 무엇인가요?",
    options: [
      "자산증식(여유자금 투자)",
      "목적자금 마련(결혼, 교육, 노후자금 등)",
      "퇴직금 운용",
      "사용예정자금(전세금, 임대차 보증금) 단기운용"
    ]
  },
  {
    id: 10,
    title: "현재 투자하려는 자금의 투자목적을 고려한 원금보존태도는 무엇인가요?",
    options: [
      "손실 위험이 있더라도 투자수익 추구",
      "원금보존을 고려하나 투자수익 추구",
      "투자수익을 고려하나 원금보존 추구"
    ]
  },
  {
    id: 11,
    title: "현재 투자하려는 자금의 투자목적을 고려한 손실 감내수준은 어느 정도인가요?",
    options: [
      "원금 보존 추구",
      "10% 이내 손실 감내 가능",
      "20% 이내 손실 감내 가능",
      "50% 이내 손실 감내 가능",
      "70% 이내 손실 감내 가능",
      "전액 손실 감내 가능"
    ]
  },
  {
    id: 12,
    title: "현재 투자하려는 자금의 투자예정기간은 얼마나 되시나요?",
    options: [
      "투자기간 상관없음",
      "3년 이상",
      "2년 이상 ~ 3년 미만",
      "1년 이상 ~ 2년 미만",
      "1년 미만"
    ]
  }
];

export default function Page01_InvestorInfo({ onNext, onClose }) {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('Q0'); // Q0, Q0_NOTICE, Q1~Q12, DONE
  const [showModal, setShowModal] = useState(false);
  const [answers, setAnswers] = useState({}); // { 1: optionIdx, 2: optionIdx, ... }
  const [userInput, setUserInput] = useState('');
  const [showVoice, setShowVoice] = useState(true);
  const [currentScript, setCurrentScript] = useState(SCRIPT);
  const [currentAudio, setCurrentAudio] = useState(AUDIO);
  const bottomRef = useRef(null);

  // 사용자가 입력창에서 질문 보냈을 때
  const handleSendQuestion = () => {
    const q = userInput.trim();
    if (!q) return;
    setUserInput('');

    const userMsg = { id: `user-q-${Date.now()}`, type: 'user', content: q };

    // 전문금융소비자 관련 질문이면 AI 답변 추가
    const isPro = q.includes('전문금융소비자') || q.includes('전문 금융소비자');
    if (isPro) {
      // 음성 스크립트 전환
      setCurrentScript(SCRIPT_PRO);
      setCurrentAudio(AUDIO_PRO);
      setShowVoice(true);
      setMessages(prev => [
        ...prev,
        userMsg,
        {
          id: `ai-pro-${Date.now()}`,
          type: 'bot',
          avatar: true,
          content: (
            <>
              <strong>전문금융소비자</strong>는 증권사로부터 공식 확인을 받은 고객을 말해요.<br /><br />
              <span style={{ fontSize: 14, color: '#444' }}>
                · 금융 지식·경험이 풍부하다고 증권사에서 인정한 분<br />
                · 은행·보험사·증권사 같은 금융회사 종사자<br />
                · 상장된 대기업 등
              </span><br /><br />
              김우리 고객님은 일반금융소비자에 해당하시니까 아래 질문에 <strong>'아니오'</strong>를 선택하시면 돼요.
            </>
          )
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        userMsg,
        {
          id: `ai-default-${Date.now()}`,
          type: 'bot',
          avatar: true,
          content: '아래 질문에 답해주시면 안내해 드릴게요. 더 궁금하신 점은 1599-0800 우리은행 콜센터로 문의해 주세요.'
        }
      ]);
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // 최초 인사
    setMessages([
      {
        id: 'init-greeting',
        type: 'bot',
        avatar: true,
        content: (
          <>
            <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.5, color: '#111' }}>
              김우리 고객님, 안녕하세요.<br />
              우리은행 WON AI 뱅커입니다.
            </span>
          </>
        )
      }
    ]);

    // 0.8초 후 안내 시작
    const t1 = setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: 'init-1',
          type: 'bot',
          avatar: false,
          content: '투자 상품에 가입하기 위해 아래 질문에 답해주세요.'
        }
      ]);
    }, 800);

    // 1.6초 후 첫 질문
    const t2 = setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: 'init-2',
          type: 'bot',
          avatar: false,
          content: '고객님은 금융투자업자(증권사)로부터 확인받은 전문금융소비자인가요?',
          options: ['아니오', '예'],
          link: '전문 금융소비자란? >',
          selectedOption: null,
          isLatest: true
        }
      ]);
    }, 1600);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelect = (messageId, option) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        return { ...m, selectedOption: option, isLatest: false };
      }
      return m;
    }));

    const userMsg = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: option
    };

    if (currentStep === 'Q0') {
      if (option === '예') {
        setMessages(prev => [
          ...prev,
          userMsg,
          {
            id: 'notice-bot-1',
            type: 'bot',
            avatar: true, // 새 질문 세트의 시작점에 아바타 노출
            content: '고객님은 현재 일반금융소비자로 등록되어 있습니다. 전문금융소비자로 진행하시려면 영업점에 방문하셔야 합니다.'
          },
          {
            id: 'notice-bot-2',
            type: 'bot',
            avatar: false,
            isNotice: true,
            options: ['영업점에서 진행할게요', '일반금융소비자로 진행할게요'],
            selectedOption: null,
            isLatest: true
          }
        ]);
        setCurrentStep('Q0_NOTICE');
      } else {
        startQuestionnaire(userMsg);
      }
    } else if (currentStep === 'Q0_NOTICE') {
      startQuestionnaire(userMsg);
    } else {
      const qIdx = parseInt(currentStep.replace('Q', ''), 10) - 1;
      const nextQIdx = qIdx + 1;

      // 답변 인덱스 저장 (Q1~Q12)
      const currentQ = QUESTIONS[qIdx];
      const optIdx = currentQ.options.indexOf(option);
      if (optIdx >= 0) {
        setAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }));
      }

      if (nextQIdx < QUESTIONS.length) {
        const nextQ = QUESTIONS[nextQIdx];
        setMessages(prev => [
          ...prev,
          userMsg,
          {
            id: `q-${nextQ.id}`,
            type: 'bot',
            avatar: true, // 질문 마다 새로운 세트의 느낌으로 아바타 노출
            content: nextQ.title,
            options: nextQ.options,
            selectedOption: null,
            isLatest: true
          }
        ]);
        setCurrentStep(`Q${nextQ.id}`);
      } else {
        setMessages(prev => [
          ...prev,
          userMsg,
          {
            id: 'done-bot',
            type: 'bot',
            avatar: true,
            isDoneGuide: true
          }
        ]);
        setCurrentStep('DONE');
      }
    }
  };

  const startQuestionnaire = (userMsg) => {
    const q1 = QUESTIONS[0];
    setMessages(prev => [
      ...prev,
      userMsg,
      {
        id: 'survey-start-1',
        type: 'bot',
        avatar: true,
        content: (
          <>
            적합한 상품을 알려드리기 위해 김우리님의 투자성향을 알아볼게요.
            <br />
            <span style={{ fontSize: 13, color: '#8E94A0', display: 'inline-block', marginTop: 6, fontWeight: 'normal' }}>
              ※ 비대면 채널에서 1일 1회 진행 가능합니다.
            </span>
          </>
        )
      },
      {
        id: 'survey-start-2',
        type: 'bot',
        avatar: false,
        content: '투자성향분석을 위해 다음 12개 질문에 답해주세요.'
      },
      {
        id: `q-${q1.id}`,
        type: 'bot',
        avatar: false,
        content: q1.title,
        options: q1.options,
        selectedOption: null,
        isLatest: true
      }
    ]);
    setCurrentStep('Q1');
  };

  return (
    <div className="phone-frame" style={{ background: '#ffffff' }}>
      <StatusBar />
      
      {/* 헤더 */}
      <div className="app-header" style={{ borderBottom: 'none' }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>투자자 정보확인</h1>
        <button className="right-icon" onClick={onClose} style={{ fontSize: 20, right: 16, cursor: 'pointer' }}>×</button>
      </div>

      {/* 스크롤 가능한 대화 구역 */}
      <div className="scroll-content" style={{ padding: '16px 20px 84px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.map((m, idx) => {
          const isDimmed = !m.isLatest && m.selectedOption !== undefined;

          if (m.type === 'bot') {
            const hasSelected = m.selectedOption !== null;

            // 금융소비자 유의사항 카드형 노출
            if (m.isNotice) {
              return (
                <div 
                  key={m.id} 
                  className="animate-chat-appear" 
                  style={{ 
                    display: 'flex', 
                    width: '100%',
                    opacity: isDimmed ? 0.5 : 1,
                    transition: 'opacity 0.3s ease',
                    marginBottom: 8
                  }}
                >
                  <div style={{ width: 44, marginRight: 10, flexShrink: 0 }}>
                    {m.avatar && <WibeeBotIcon />}
                  </div>
                  
                  <div style={{ 
                    flex: 1,
                    padding: '24px 20px', 
                    background: '#F4F5F7', 
                    borderRadius: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    boxSizing: 'border-box',
                    borderTopLeftRadius: m.avatar ? 4 : 24
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#111' }}>금융소비자 유의사항</div>
                      
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#222' }}>집합투자상품</div>
                      <ul style={{ paddingLeft: 16, margin: '0 0 16px 0', fontSize: 13, color: '#555', lineHeight: 1.6, wordBreak: 'keep-all', fontWeight: 400 }}>
                        <li>이 금융상품은 <span style={{ color: '#1b64da' }}>예금자보호법에 따라 보호되지 않습니다.</span></li>
                        <li>운용실적에 따라 <span style={{ color: '#1b64da' }}>원금손실이 발생</span>할 수 있으며, 손실가능범위는 각 상품에 따라 다를 수 있습니다.</li>
                        <li>환매 또는 해지시 환매수수료가 발생할 수 있습니다. 또한 집합투자규약 및 투자설명서에 따라 중도인출이 불가할 수 있습니다.</li>
                      </ul>

                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#222' }}>신탁, 퇴직연금, 일임형 ISA</div>
                      <ul style={{ paddingLeft: 16, margin: 0, fontSize: 13, color: '#555', lineHeight: 1.6, wordBreak: 'keep-all', fontWeight: 400 }}>
                        <li>예금자보호여부 및 보호한도, 원금손실가능성, 중도해지시 불이익, 세율, 종합소득세신고 대상여부 등이 각 상품에 따라 다를 수 있습니다.</li>
                      </ul>
                    </div>

                    {/* 선택지 (카드 내부 포함) */}
                    {m.options && (
                      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                        {m.options.map(opt => {
                          const isSelected = m.selectedOption === opt;
                          return (
                            <button
                              key={opt}
                              disabled={hasSelected}
                              onClick={() => handleSelect(m.id, opt)}
                              style={{ 
                                width: '100%',
                                background: '#EAECEF',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: hasSelected ? 'default' : 'pointer',
                                transition: 'all 0.15s ease',
                                boxSizing: 'border-box'
                              }}
                            >
                              <span style={{ 
                                textAlign: 'left', 
                                lineHeight: 1.45,
                                fontSize: 14.5,
                                color: isDimmed ? (isSelected ? '#111111' : '#A3A7B5') : '#222222',
                                fontWeight: isSelected ? '700' : '500'
                              }}>
                                {opt}
                              </span>
                              <CheckIcon color={isSelected ? '#1B64DA' : (hasSelected ? 'transparent' : '#8E94A0')} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // 모든 문항 완료 안내 및 결과보기 버튼
            if (m.isDoneGuide) {
              return (
                <div 
                  key={m.id} 
                  className="animate-chat-appear"
                  style={{ display: 'flex', width: '100%', marginBottom: 8 }}
                >
                  <div style={{ width: 44, marginRight: 10, flexShrink: 0 }}>
                    {m.avatar && <WibeeBotIcon />}
                  </div>
                  
                  <div style={{ 
                    flex: 1,
                    padding: '24px 20px', 
                    background: '#F4F5F7', 
                    borderRadius: 24,
                    borderTopLeftRadius: m.avatar ? 4 : 24,
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: '#111', lineHeight: 1.45 }}>
                      투자성향 분석에 필요한 답변을 모두 작성했어요.
                    </div>
                    <p style={{ fontSize: 13, color: '#666', margin: '0 0 12px 0', lineHeight: 1.6, wordBreak: 'keep-all', fontWeight: 400 }}>
                      ※ 본 질문지에서 수집된 개인정보는 고객님께 적합한 상품을 제공하기 위한 기초자료만으로 활용할 예정이며 우리은행이 기밀로 보호하겠습니다.
                    </p>
                    <p style={{ fontSize: 13, color: '#666', margin: '0 0 20px 0', lineHeight: 1.6, wordBreak: 'keep-all', fontWeight: 400 }}>
                      ※ 투자자성향 분석 결과는 고객님께서 제공하신 정보를 바탕으로 분석되며, 투자목적, 투자기간, 투자목적을 고려한 손실감내수준, 금융상품에 대한 이해도, 재산상황, 투자경험, 연령 등에 비추어 적합하지 않은 상품은 가입이 불가합니다.
                    </p>
                    
                    <button
                      className="chat-result-btn"
                      onClick={() => setShowModal(true)}
                      style={{ 
                        width: '100%',
                        borderRadius: '16px', 
                        padding: '16px',
                        background: '#1b64da',
                        color: '#fff',
                        fontWeight: 700,
                        border: 'none',
                        fontSize: 15
                      }}
                    >
                      결과보기
                    </button>
                  </div>
                </div>
              );
            }

            // 일반 챗봇 말풍선 (질문 + 선택지 + 링크 통합 카드형)
            return (
              <div 
                key={m.id} 
                className="animate-chat-appear"
                style={{ 
                  display: 'flex', 
                  width: '100%',
                  opacity: isDimmed ? 0.5 : 1,
                  transition: 'opacity 0.3s ease',
                  marginBottom: 8
                }}
              >
                <div style={{ width: 44, marginRight: 10, flexShrink: 0 }}>
                  {m.avatar && <WibeeBotIcon />}
                </div>
                
                <div style={{ 
                  flex: 1,
                  padding: '24px 20px', 
                  background: '#F4F5F7', 
                  borderRadius: 24,
                  borderTopLeftRadius: m.avatar ? 4 : 24,
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ 
                    color: '#111111', 
                    lineHeight: 1.5, 
                    fontSize: 15, 
                    fontWeight: 700 
                  }}>
                    {m.content}
                  </div>

                  {/* 선택지 버튼 목록 (말풍선 내부 배치 및 답변 선택 후에도 유지) */}
                  {m.options && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20, width: '100%' }}>
                      {m.options.map(opt => {
                        const isSelected = m.selectedOption === opt;
                        return (
                          <button
                            key={opt}
                            disabled={hasSelected}
                            onClick={() => handleSelect(m.id, opt)}
                            style={{ 
                              width: '100%',
                              background: '#EAECEF',
                              border: 'none',
                              borderRadius: '16px',
                              padding: '16px 20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: hasSelected ? 'default' : 'pointer',
                              transition: 'all 0.15s ease',
                              boxSizing: 'border-box'
                            }}
                          >
                            <span style={{ 
                              textAlign: 'left', 
                              lineHeight: 1.45,
                              fontSize: 14.5,
                              color: isDimmed ? (isSelected ? '#111111' : '#A3A7B5') : '#222222',
                              fontWeight: isSelected ? '700' : '500'
                            }}>{opt}</span>
                            <CheckIcon color={isSelected ? '#1B64DA' : (hasSelected ? 'transparent' : '#8E94A0')} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 링크 (말풍선 내부 배치) */}
                  {m.link && !m.selectedOption && (
                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                      <a href="#" onClick={(e) => e.preventDefault()} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#555555', fontWeight: 600, textDecoration: 'none' }}>
                        {m.link}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          } else {
            // 사용자 응답 말풍선 (우측 정렬, 가이드 양식 반영)
            return (
              <div 
                key={m.id} 
                className="animate-chat-appear"
                style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: 8 }}
              >
                <div style={{ 
                  background: '#EBF2FC', 
                  borderRadius: 20, 
                  padding: '12px 18px', 
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#111111',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>{m.content}</span>
                  <PencilIcon />
                </div>
              </div>
            );
          }
        })}
        <div ref={bottomRef} style={{ height: 10 }} />
      </div>

      {/* 음성 가이드 — 화면 하단 스크립트 + 오디오 */}
      {!showVoice && (
        <button className="voice-fab" onClick={() => setShowVoice(true)}><Icon name="volume" size={24} color="#fff" /></button>
      )}
      {showVoice && (
        <VoiceGuide
          script={currentScript}
          audio={currentAudio}
          onClose={() => setShowVoice(false)}
          onCommand={() => {}}
        />
      )}

      {/* 하단 입력창 — 질문하기 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #eee',
        padding: '10px 14px calc(10px + env(safe-area-inset-bottom)) 14px',
        display: 'flex', alignItems: 'center', gap: 8, zIndex: 50
      }}>
        <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 22, display: 'flex', alignItems: 'center', padding: '8px 14px' }}>
          <input
            type="text"
            placeholder="궁금한 점을 물어보세요"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion()}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15 }}
          />
          <button onClick={handleSendQuestion} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#1b64da', fontSize: 18, fontWeight: 700 }}>↑</button>
        </div>
      </div>

      {/* 전자서명 모달 팝업 */}
      {showModal && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '24px', padding: '24px',
            width: '320px', display: 'flex', flexDirection: 'column'
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#111' }}>전자서명</h2>
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, marginBottom: 24, wordBreak: 'keep-all' }}>
              다음의 인증절차를 통해 전자서명을 진행하겠습니다. 입력하신 내용을 바탕으로 투자성향분석을 진행하시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  background: '#f1f3f5', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: 14.5, 
                  fontWeight: 700, 
                  color: '#555555', 
                  cursor: 'pointer' 
                }}
                onClick={() => setShowModal(false)}
              >
                취소
              </button>
              <button 
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  background: '#2b66ff', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: 14.5, 
                  fontWeight: 700, 
                  color: '#ffffff', 
                  cursor: 'pointer' 
                }}
                onClick={() => {
                  setShowModal(false);
                  const type = calculateInvestorType(answers);
                  onNext(type);
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

