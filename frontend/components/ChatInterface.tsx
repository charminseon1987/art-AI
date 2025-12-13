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

  // 고정 질문 세트 (명세에 따른)
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

  // 선택 질문 표시 여부 결정 (아이 응답이 길면 표시)
  const shouldShowOptionalQuestion = () => {
    if (responses.length < 4) return false;
    const avgLength = responses.reduce((sum, r) => sum + r.answer.length, 0) / responses.length;
    return avgLength > 10; // 평균 응답 길이가 10자 이상이면 선택 질문 표시
  };

  const getCurrentQuestion = () => {
    if (currentQuestionIndex < 4) {
      return fixedQuestions[currentQuestionIndex];
    } else if (currentQuestionIndex === 4 && shouldShowOptionalQuestion()) {
      return fixedQuestions[4];
    }
    return null;
  };

  const currentQuestion = getCurrentQuestion();

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return;
    if (!currentQuestion) return;

    const newResponses = [
      ...responses,
      { question: currentQuestion.text, answer: currentAnswer },
    ];
    setResponses(newResponses);
    setCurrentAnswer("");

    // 다음 질문 결정
    const nextIndex = currentQuestionIndex + 1;
    
    // 필수 질문 4개 완료 후
    if (nextIndex === 4) {
      if (shouldShowOptionalQuestion()) {
        setCurrentQuestionIndex(4);
      } else {
        // 선택 질문 스킵하고 완료
        handleComplete(newResponses);
      }
    } else if (nextIndex > 4) {
      // 모든 질문 완료
      handleComplete(newResponses);
    } else {
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

      {/* 현재 질문 */}
      {currentQuestion && !isCompleting && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-900 font-medium whitespace-pre-line">{currentQuestion.text}</p>
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
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="답변을 입력하세요..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-800 bg-white"
              rows={3}
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
    </div>
  );
}
