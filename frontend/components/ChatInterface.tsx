"use client";

import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";

interface ChatInterfaceProps {
  reportData: any;
  onComplete: (responses: any[]) => void;
}

export default function ChatInterface({ reportData, onComplete }: ChatInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  // AI가 생성한 상담 질문 우선 사용, 없으면 기본 질문 사용
  const aiGeneratedQuestions = reportData?.reflection_questions?.questions || [];
  
  // 고정 질문 세트 (명세에 따른 - AI 질문이 없을 때 사용)
  const fixedQuestions = [
    {
      id: "Q1",
      text: "이 그림을 그릴 때 어떤 기분이었나요?\n말로 하기 어렵다면 한 단어만 적어도 괜찮아요 🙂",
      type: "icebreaking"
    },
    {
      id: "Q2",
      text: "이 그림에서 가장 마음에 드는 부분은 어디인가요?\n색, 모양, 아무거나 괜찮아요.",
      type: "exploration"
    },
    {
      id: "Q3",
      text: "그 부분을 선택했을 때 어떤 느낌이 들었나요?",
      type: "feeling"
    },
    {
      id: "Q4",
      text: "이 그림이 말을 할 수 있다면,\n지금 뭐라고 말할 것 같아요?",
      type: "story"
    },
    {
      id: "Q5",
      text: "이 그림을 다시 그린다면\n조금 바꾸고 싶은 곳이 있을까요?\n없어도 괜찮아요 🙂",
      type: "optional"
    }
  ];

  // 사용할 질문 목록 결정 (AI 질문이 있으면 사용, 없으면 기본 질문)
  const questionsToUse = aiGeneratedQuestions.length > 0 
    ? aiGeneratedQuestions.slice(0, 5).map((q: string, idx: number) => ({
        id: `AI-Q${idx + 1}`,
        text: q,
        type: idx === 0 ? "icebreaking" : idx < 3 ? "exploration" : "story"
      }))
    : fixedQuestions;

  // 최대 질문 수 (AI 질문이 있으면 최대 5개, 기본 질문은 4개 필수)
  const maxQuestions = aiGeneratedQuestions.length > 0 
    ? Math.min(aiGeneratedQuestions.length, 5) // AI 질문이 있으면 최대 5개
    : 4; // 기본 질문은 4개 필수

  const getCurrentQuestion = () => {
    if (currentQuestionIndex < maxQuestions) {
      return questionsToUse[currentQuestionIndex];
    }
    return null;
  };

  const currentQuestion = getCurrentQuestion();

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return;
    if (!currentQuestion) return;

    // 현재 답변을 깨끗하게 저장 (앞뒤 공백 제거)
    const cleanAnswer = currentAnswer.trim();
    
    const newResponses = [
      ...responses,
      { question: currentQuestion.text, answer: cleanAnswer },
    ];
    setResponses(newResponses);
    
    // 답변 입력 필드 완전히 초기화
    setCurrentAnswer("");

    // 다음 질문 결정
    const nextIndex = currentQuestionIndex + 1;
    
    // 최대 질문 수 확인
    if (nextIndex >= maxQuestions) {
      // 모든 질문 완료
      handleComplete(newResponses);
    } else {
      // 다음 질문으로 이동 (상태 업데이트를 명확하게)
      setCurrentQuestionIndex(nextIndex);
    }
  };

  const handleComplete = (finalResponses: Array<{ question: string; answer: string }>) => {
    setIsCompleting(true);
    // Chat 종료 멘트 표시 후 완료
    setTimeout(() => {
      onComplete(finalResponses);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 채팅 히스토리 */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {responses.map((response, idx) => (
          <div key={idx} className="space-y-2">
            {/* AI 질문 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-900 font-medium whitespace-pre-line">{response.question}</p>
              </div>
            </div>
            {/* 사용자 답변 */}
            <div className="flex items-start gap-3 justify-end">
              <div className="flex-1 bg-blue-100 text-gray-800 rounded-lg p-4 text-right border border-blue-200">
                <p className="whitespace-pre-wrap">{response.answer}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat 종료 멘트 */}
      {isCompleting && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-gray-800 whitespace-pre-line">
            이야기해줘서 고마워요.<br />
            이제 그림과 이야기를 정리해서<br />
            상담에 도움이 되는 참고 자료를 만들어볼게요.
          </p>
        </div>
      )}

      {/* 질문이 모두 완료된 경우 */}
      {!currentQuestion && !isCompleting && responses.length > 0 && (
        <div className="text-center py-4">
          <p className="text-gray-600">모든 질문에 답변해주셔서 감사합니다.</p>
          <button
            onClick={() => handleComplete(responses)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            리포트 생성하기
          </button>
        </div>
      )}

      {/* 현재 질문 */}
      {currentQuestion && !isCompleting && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between gap-2">
                <p className="text-gray-900 font-medium flex-1">{currentQuestion.text}</p>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  ({currentQuestionIndex + 1}/{maxQuestions})
                </span>
              </div>
            </div>
          </div>

          {/* 보호자 안내 문구 (첫 질문일 때만) */}
          {currentQuestionIndex === 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg text-sm text-gray-700">
              <p className="whitespace-pre-line">
                아이의 말을 그대로 적어주셔도 괜찮고,<br />
                부모님이 느낀 점을 적어주셔도 괜찮습니다.<br />
                정답은 없습니다 🙂
              </p>
            </div>
          )}

          {/* 답변 입력 */}
          <div className="flex gap-2">
            <textarea
              key={`textarea-${currentQuestionIndex}`}
              value={currentAnswer}
              onChange={(e) => {
                // 입력값을 깨끗하게 설정
                setCurrentAnswer(e.target.value);
              }}
              onBlur={() => {
                // 포커스가 벗어날 때도 깨끗하게 정리
                setCurrentAnswer(prev => prev.trim());
              }}
              placeholder="답변을 입력하세요..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-800 bg-white"
              rows={3}
              autoFocus={false}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey === false) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!currentAnswer.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 질문 진행 상황 표시 */}
      {!isCompleting && questionsToUse.length > 0 && currentQuestion && (
        <div className="text-center text-sm text-gray-500">
          질문 {currentQuestionIndex + 1} / {maxQuestions}
        </div>
      )}
    </div>
  );
}
