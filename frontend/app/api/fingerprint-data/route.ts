export const runtime = 'edge';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Python 백엔드에서 하워드 가드너 정보 가져오기
    const pythonBackendUrl =
      process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

    const response = await fetch(`${pythonBackendUrl}/api/fingerprint-data`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // 백엔드 API가 없으면 기본 데이터 반환
      return NextResponse.json({
        success: true,
        data: {
          thumb_personality: {
            title: "엄지 주성격 분석",
            description:
              "엄지손가락의 지문 패턴은 개인의 주된 성격 특성을 나타내는 중요한 지표입니다.",
            patterns: {
              "나선형 (Whorl)": {
                personality: "독립적이고 리더십이 강하며, 목표 지향적인 성격",
                traits: ["자신감", "결단력", "목표 추구", "독립성"],
                learning_style:
                  "체계적이고 구조화된 학습 환경을 선호하며, 명확한 목표가 있을 때 가장 잘 학습합니다.",
              },
              "고리형 (Loop)": {
                personality: "협조적이고 적응력이 뛰어나며, 대인관계에 능숙한 성격",
                traits: ["협력성", "적응력", "소통 능력", "공감 능력"],
                learning_style:
                  "협력적 학습 환경을 선호하며, 그룹 활동과 상호작용을 통한 학습에 효과적입니다.",
              },
              "호형 (Arch)": {
                personality: "안정적이고 신중하며, 내면을 중시하는 성격",
                traits: ["신중함", "안정성", "내면 탐구", "집중력"],
                learning_style:
                  "조용하고 안정적인 학습 환경을 선호하며, 깊이 있는 학습과 자기 주도적 학습에 적합합니다.",
              },
              "복합형 (Composite)": {
                personality: "다재다능하고 유연하며, 다양한 관점을 가진 성격",
                traits: ["다재다능", "유연성", "창의성", "통합적 사고"],
                learning_style:
                  "다양한 학습 방법을 조합하여 학습하며, 창의적이고 통합적인 접근을 선호합니다.",
              },
            },
          },
          fingerprint_characteristics: {
            title: "지문별 특징 상세",
            description:
              "각 손가락의 지문 패턴은 서로 다른 지능 영역과 성격 특성을 나타냅니다.",
            detailed_features: {
              "나선형 (Whorl)": {
                visual_description: "중앙에서 나선형으로 퍼지는 원형 패턴",
                intelligence_connection:
                  "논리수학지능, 음악지능, 자연지능과 강한 연관성",
                personality_indicators:
                  "체계적 사고, 분석적 능력, 패턴 인식 능력이 뛰어남",
                strengths: ["논리적 추론", "체계적 접근", "패턴 분석", "목표 지향"],
                development_areas: "창의적 표현, 감정 인식, 대인관계 기술",
              },
              "고리형 (Loop)": {
                visual_description: "한쪽 방향으로 흐르는 U자형 고리 패턴",
                intelligence_connection:
                  "공간지능, 신체운동지능, 대인지능과 강한 연관성",
                personality_indicators:
                  "실행력, 공간 인식, 대인관계 능력이 뛰어남",
                strengths: ["실행력", "공간 감각", "협력", "적응력"],
                development_areas: "자기 성찰, 독립적 사고, 깊이 있는 분석",
              },
              "호형 (Arch)": {
                visual_description: "아치 모양의 단순하고 안정적인 패턴",
                intelligence_connection:
                  "자기성찰지능, 자연지능과 강한 연관성",
                personality_indicators:
                  "안정성, 내면 탐구, 자연 친화적 성향",
                strengths: ["안정성", "집중력", "내면 탐구", "자연 관찰"],
                development_areas: "사회적 상호작용, 외향적 표현, 다양한 경험",
              },
              "복합형 (Composite)": {
                visual_description:
                  "여러 패턴이 복합적으로 나타나는 복잡한 형태",
                intelligence_connection: "대인지능, 언어지능과 강한 연관성",
                personality_indicators:
                  "다양한 지능의 조화, 적응력, 소통 능력",
                strengths: ["다재다능", "적응력", "소통 능력", "통합적 사고"],
                development_areas:
                  "특정 영역의 깊이 있는 전문성, 집중력 향상",
              },
            },
          },
          report_example: {
            title: "지문검사 결과 보고서 예시",
            sections: [
              {
                section_title: "1. 기본 정보",
                content: "이름: 홍길동 | 나이: 8세 | 검사일: 2024년 1월 15일",
              },
              {
                section_title: "2. 지문 패턴 분석",
                content:
                  "엄지(양손): 나선형 | 검지: 고리형(좌), 나선형(우) | 중지: 고리형(양손) | 약지: 나선형(양손) | 소지: 호형(양손)",
              },
              {
                section_title: "3. 엄지 주성격 분석",
                content:
                  "나선형 패턴으로 나타난 주성격은 독립적이고 리더십이 강하며, 목표 지향적인 특성을 보입니다. 체계적이고 구조화된 학습 환경에서 가장 잘 학습하며, 명확한 목표가 있을 때 동기가 높아집니다.",
              },
              {
                section_title: "4. 강점 지능 분석",
                content:
                  "논리수학지능과 음악지능이 특히 발달되어 있으며, 체계적 사고와 패턴 인식 능력이 뛰어납니다. 공간지능과 대인지능도 양호한 수준입니다.",
              },
              {
                section_title: "5. 맞춤형 학습 제안",
                content:
                  "체계적이고 구조화된 학습 방법을 선호하므로, 단계별 학습 계획과 명확한 목표 설정이 효과적입니다. 논리적 사고를 활용한 수학 학습과 패턴 인식이 필요한 음악 활동을 권장합니다.",
              },
              {
                section_title: "6. 진로 탐색 방향",
                content:
                  "논리적 사고와 체계적 접근이 강점이므로, 수학, 과학, 공학 분야에 관심을 가질 수 있습니다. 음악적 감각도 발달되어 있으므로 음악 관련 활동도 함께 고려해볼 수 있습니다.",
              },
            ],
          },
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("지문 데이터 로드 오류:", error);
    // 오류 발생 시 기본 데이터 반환
    return NextResponse.json({
      success: true,
      data: {
        thumb_personality: {
          title: "엄지 주성격 분석",
          description:
            "엄지손가락의 지문 패턴은 개인의 주된 성격 특성을 나타내는 중요한 지표입니다.",
          patterns: {},
        },
        fingerprint_characteristics: {
          title: "지문별 특징 상세",
          description:
            "각 손가락의 지문 패턴은 서로 다른 지능 영역과 성격 특성을 나타냅니다.",
          detailed_features: {},
        },
        report_example: {
          title: "지문검사 결과 보고서 예시",
          sections: [],
        },
      },
    });
  }
}









