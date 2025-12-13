"use client";

import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";

interface ChatInterfaceProps {
  reportData: any;
  onComplete: (
    responses: any[],
    userInfo?: { age?: string; gender?: string }
  ) => void;
}

export default function ChatInterface({
  reportData,
  onComplete,
}: ChatInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<
    Array<{ question: string; answer: string }>
  >([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  // AI가 생성한 상담 질문 우선 사용 (다양한 데이터 구조 지원)
  // API 응답 구조: { report: { reflection_questions: { questions: [...] } } }
  const aiGeneratedQuestions =
    reportData?.report?.reflection_questions?.questions ||
    reportData?.reflection_questions?.questions ||
    [];

  // 디버깅용 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === "development") {
    console.log("ChatInterface - reportData:", reportData);
    console.log("ChatInterface - aiGeneratedQuestions:", aiGeneratedQuestions);
    console.log(
      "ChatInterface - questions count:",
      aiGeneratedQuestions.length
    );
  }

  // 상담 질문 세트 (터미널에서 제공된 질문들)
  const counselingQuestions = [
    {
      id: "Q1",
      text: "당신이 사용한 다양한 색상 중에서 특히 어떤 색상이 이 그림에서 특별한 의미를 가진다고 느끼시나요?",
      type: "color",
    },
    {
      id: "Q2",
      text: "사각형, 삼각형, 둥글고 풍성한 형태 등 여러 형태가 함께 어우러진 모습에서 어떤 감정을 느끼셨나요?",
      type: "shape",
    },
    {
      id: "Q3",
      text: "왼쪽에 위치한 인물과 고양이의 배치가 그림에서 어떤 이야기를 전달한다고 생각하시나요?",
      type: "composition",
    },
    {
      id: "Q4",
      text: "그림을 통해 느끼는 행복과 따뜻함은 어떤 경험에서 비롯된 것인지 이야기해주실 수 있나요?",
      type: "emotion",
    },
    {
      id: "Q5",
      text: "그림의 전체적인 밝은 분위기가 당신의 기분이나 상태에 어떤 영향을 미쳤다고 생각하시나요?",
      type: "mood",
    },
    {
      id: "Q6",
      text: "상징적으로 표현된 손을 잡고 있는 인물들의 모습이 어떤 의미를 지니고 있다고 생각하시나요?",
      type: "symbol",
    },
    {
      id: "Q7",
      text: "가정과 안정성을 상징하는 집과 나무는 당신의 삶에서 어떤 장소나 순간과 연결된다고 느끼시나요?",
      type: "connection",
    },
    {
      id: "Q8",
      text: "이 그림을 그릴 때의 경험은 어떤 감정이나 생각을 불러일으켰나요?",
      type: "experience",
    },
    {
      id: "Q9",
      text: "그림을 그리는 과정에서 느꼈던 자유로움은 어떤 방식으로 표현되었나요?",
      type: "freedom",
    },
    {
      id: "Q10",
      text: "마지막으로, 이 그림을 그리고 나서 어떤 변화나 깨달음이 있었는지 나눠주실 수 있나요?",
      type: "reflection",
    },
  ];

  // 고정 질문 세트 (명세에 따른 - AI 질문이 없을 때 사용)
  const fixedQuestions = [
    {
      id: "Q1",
      text: "이 그림을 그릴 때 어떤 기분이었나요?\n말로 하기 어렵다면 한 단어만 적어도 괜찮아요 🙂",
      type: "icebreaking",
    },
    {
      id: "Q2",
      text: "이 그림에서 가장 마음에 드는 부분은 어디인가요?\n색, 모양, 아무거나 괜찮아요.",
      type: "exploration",
    },
    {
      id: "Q3",
      text: "그 부분을 선택했을 때 어떤 느낌이 들었나요?",
      type: "feeling",
    },
    {
      id: "Q4",
      text: "이 그림이 말을 할 수 있다면,\n지금 뭐라고 말할 것 같아요?",
      type: "story",
    },
    {
      id: "Q5",
      text: "이 그림을 다시 그린다면\n조금 바꾸고 싶은 곳이 있을까요?\n없어도 괜찮아요 🙂",
      type: "optional",
    },
  ];

  // 사용할 질문 목록 결정 (처음 4개만 사용 - 기본 질문 사용)
  const questionsToUse = fixedQuestions.slice(0, 4);

  // 최대 질문 수 (처음 4개만 사용)
  const maxQuestions = 4;

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

  const handleComplete = (
    finalResponses: Array<{ question: string; answer: string }>
  ) => {
    setIsCompleting(true);
    // Chat 종료 멘트 표시 후 완료
    setTimeout(() => {
      onComplete(finalResponses, {
        age: age || undefined,
        gender: gender || undefined,
      });
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
                <p className="text-gray-900 font-medium whitespace-pre-line">
                  {response.question}
                </p>
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
            이야기해줘서 고마워요.
            <br />
            이제 그림과 이야기를 정리해서
            <br />
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

      {/* 나이/성별 입력 (첫 질문 전에만 표시) */}
      {currentQuestionIndex === 0 && responses.length === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            기본 정보 입력
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                나이 (선택사항)
              </label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="예: 7세, 초등 1학년"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                성별 (선택사항)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white text-sm"
              >
                <option value="">선택 안함</option>
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 현재 질문 */}
      {currentQuestion && !isCompleting && (
        <div className="space-y-4">
          {/* 보호자 안내 문구 (첫 질문일 때만) - 위로 이동 */}
          {currentQuestionIndex === 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg text-sm text-gray-700">
              <p className="whitespace-pre-line">
                아이의 말을 그대로 적어주셔도 괜찮고,
                <br />
                부모님이 느낀 점을 적어주셔도 괜찮습니다.
                <br />
                정답은 없습니다 🙂
              </p>
            </div>
          )}

          {/* 질문 - 아래로 이동 */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between gap-2">
                <p className="text-gray-900 font-medium flex-1 whitespace-pre-line">
                  {currentQuestion.text}
                </p>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  ({currentQuestionIndex + 1}/{maxQuestions})
                </span>
              </div>
            </div>
          </div>

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
                setCurrentAnswer((prev) => prev.trim());
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
