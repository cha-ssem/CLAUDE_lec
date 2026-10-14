/**
 * Claude 비즈니스 강의 허브 - 메인 로직 스크립트 (1일차 프롬프트 6대 공식 & 산출물 5종 완전판)
 */

// ==========================================================================
// 0. 유틸리티 함수
// ==========================================================================
/**
 * HTML 특수문자 이스케이프
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================================================
// 1. 데이터 저장소
// ==========================================================================
const SESSIONS_DATA = {
  1: {
    tag: "1회차 실습 룸",
    title: "Claude 첫걸음: 3총사 비교 & 실패 없는 프롬프트 6대 공식",
    sub: "역할(Role), 배경(Context), 지시(Instructions), 출력(Format) 4대 기본기에 규칙(Rules)과 예시(Examples)를 더해 완벽한 결과물을 뽑아냅니다.",
    notionMission: "오늘 실습에서 생성된 가장 마음에 드는 거래처 인사말/안내문 1개를 복사하여 노션 <strong>[1회차 프롬프트 보관함]</strong>에 붙여넣으세요.",
    
    // 업종별 빠른 입력 프리셋
    presets: [
      {
        label: "식품/유통업",
        values: {
          role: "20년 경력의 대기업 비서실장이자 B2B 고객 소통 전문 기획자 (품격 있고 신뢰감 넘치는 태도)",
          context: "우리는 산지 직송 친환경 농산물 유통 법인 '한결푸드'이며, 추석 명절을 맞아 10년 이상 거래한 주요 파트너사 30곳 대표이사님께 감사 인사 및 가을 제철 신제품 출하 안내를 발송하려고 함.",
          instruction: "1단계: 올 한 해 변함없는 신뢰와 성원에 깊은 감사를 표할 것.\n2단계: 4분기 친환경 농산물 신제품 출하 소식을 1줄 자연스럽게 덧붙일 것.\n3단계: 대표님과 임직원분들의 건강과 풍요로운 명절을 기원하며 정중히 마무리할 것.",
          format: "①정중한 공식 서한형 (공문/이메일용)\n②친근하고 따뜻한 관계형 (카카오톡용)\n③핵심만 담은 모바일 간결형 (150자 이내 문자용)"
        }
      },
      {
        label: "실버/헬스케어",
        values: {
          role: "시니어 헬스케어 및 복지 서비스 전문 홍보팀장 (따뜻하고 신뢰감을 주는 어조)",
          context: "신규 런칭하는 맞춤형 방문 간호/돌봄 서비스 '실버케어365'의 무료 건강상담 바우처 이벤트를 지역 복지관 및 고객에게 안내.",
          instruction: "1단계: 어르신들의 건강한 일상을 돕는 서비스 취지를 따뜻하게 소개할 것.\n2단계: 선착순 50명 대상 무료 1:1 맞춤 영양/건강 상담 혜택을 명확히 안내할 것.\n3단계: 간편한 신청 방법과 문의처를 안내하며 신뢰감을 줄 것.",
          format: "①보호자(자녀)용 카카오톡 안내문\n②복지관 및 기관 협조 공문 서식\n③문자메시지 알림용 3종"
        }
      },
      {
        label: "전문 컨설팅/경영",
        values: {
          role: "20년 경력의 경영전략 및 M&A 전문 수석 컨설턴트 (논리적이고 격조 높은 어조)",
          context: "기존 고객사 대표이사 및 임원진을 대상으로 '2027년도 경기 전망 및 법인 절세 전략 세미나' VIP 초청장 발송.",
          instruction: "1단계: 급변하는 경제 환경 속 파트너십의 가치를 강조할 것.\n2단계: 세미나 핵심 아젠다(자금 조달, 법인 전환, 세무 리스크 방어) 3가지를 명확히 제시할 것.\n3단계: VIP 사전 등록 혜택과 일시/장소를 안내하고 참석을 정중히 요청할 것.",
          format: "①VIP 공식 초청 공문서 서식\n②이메일 본문형 텍스트\n③모바일 알림톡 요약본"
        }
      }
    ],

    fields: [
      { id: "role", label: "① AI에게 맡길 역할 (Role) - [경력 + 전문분야 + 태도 3단 조합]", placeholder: "예: 20년 경력의 대기업 비서실장이자 정중한 비즈니스 기획자", default: "20년 경력의 대기업 비서실장이자 정중한 비즈니스 기획자" },
      { id: "context", label: "② 현재 상황 및 배경 (Context) - [누가, 누구에게, 왜 5W1H 팩트]", placeholder: "예: 친환경 농산물 유통 법인이며, 추석을 맞아 30곳 단골 거래처에 감사 인사 발송", default: "친환경 농산물 유통 법인이며, 추석을 맞아 30곳 단골 거래처에 감사 인사 발송" },
      { id: "instruction", label: "③ 구체적인 업무 지시 (Instructions) - [동사형 번호 매기기 Step-by-Step]", placeholder: "예: 1단계 감사 인사 ➔ 2단계 신제품 소식 ➔ 3단계 명절 덕담", default: "1단계: 한 해 성원에 대한 깊은 감사 전하기\n2단계: 가을 제철 신제품 출시 소식 1줄 언급하기\n3단계: 대표님과 임직원 건강 기원 덕담으로 마무리하기" },
      { id: "format", label: "④ 원하는 출력 형태 (Output Format) - [5대 출력 포맷 선택]", placeholder: "예: ①공식 서한형 ②친근한 카톡형 ③짧은 문자형 3가지 버전으로 구분 출력", default: "①공식 서한형 ②친근한 카톡형 ③짧은 문자형 3가지 버전으로 구분 출력" }
    ],

    // Claude 최적화 XML 구조화 프롬프트 생성기 (Rules & Guardrails 탑재 + 노란색 하이라이트 지원)
    generatePrompt: (data, isHtml = false) => {
      const wrapVal = (val, fallback) => {
        const text = val || fallback;
        return isHtml ? `<span class="prompt-highlight-yellow">${escapeHtml(text)}</span>` : text;
      };

      const roleVal = wrapVal(data.role, '20년 경력의 베테랑 비서실장');
      const contextVal = wrapVal(data.context, '거래처 감사 인사 발송');
      const instructionVal = wrapVal(data.instruction, '정중하고 신뢰감 있게 작성해 줘.');
      const formatVal = wrapVal(data.format, '3가지 톤으로 구분');

      if (isHtml) {
        return `&lt;role&gt;\n너는 "${roleVal}"이야.\n&lt;/role&gt;\n\n` +
               `&lt;context&gt;\n- 비즈니스 배경: ${contextVal}\n&lt;/context&gt;\n\n` +
               `&lt;rules&gt;\n` +
               `1. 불필요한 사족("안녕하세요, 비서실장입니다" 등)을 쓰지 말고 결과 본문만 즉시 작성할 것.\n` +
               `2. 어색한 번역투 표현을 배제하고, 자연스럽고 정중한 한국어 비즈니스 경어체를 사용할 것.\n` +
               `3. 요청한 3가지 톤의 제목을 명확히 달고 가독성 높게 구분하여 출력할 것.\n` +
               `&lt;/rules&gt;\n\n` +
               `&lt;instructions&gt;\n${instructionVal}\n&lt;/instructions&gt;\n\n` +
               `&lt;output_format&gt;\n${formatVal}\n&lt;/output_format&gt;`;
      }

      return `<role>\n너는 "${roleVal}"이야.\n</role>\n\n` +
             `<context>\n- 비즈니스 배경: ${contextVal}\n</context>\n\n` +
             `<rules>\n` +
             `1. 불필요한 사족("안녕하세요, 비서실장입니다" 등)을 쓰지 말고 결과 본문만 즉시 작성할 것.\n` +
             `2. 어색한 번역투 표현을 배제하고, 자연스럽고 정중한 한국어 비즈니스 경어체를 사용할 것.\n` +
             `3. 요청한 3가지 톤의 제목을 명확히 달고 가독성 높게 구분하여 출력할 것.\n` +
             `</rules>\n\n` +
             `<instructions>\n${instructionVal}\n</instructions>\n\n` +
             `<output_format>\n${formatVal}\n</output_format>`;
    },

    checklist: [
      "Claude.ai(웹), Claude Desktop(앱), Claude Code(개발자용)의 차이를 이해했다.",
      "Claude.ai로 만들 수 있는 산출물 5종(텍스트, 표, 기획서, 법률검토, 아티팩트)을 파악했다.",
      "Role 설정 시 [경력 + 전문분야 + 태도] 3단 조합을 적용했다.",
      "Context에 5W1H 핵심 팩트를 2줄 이상 제공했다.",
      "Instructions를 동사형 번호 매기기(Step-by-step)로 작성했다.",
      "오늘 생성된 결과물을 노션 [1회차 보관함]에 성공적으로 복사·저장했다."
    ],

    // 1일차 수업 마무리 핵심 AI 용어 3분 톡
    glossary: [
      { term: "프롬프트 (Prompt)", metaphor: "신입 비서에게 주는 업무 지시서", desc: "AI에게 무엇을 어떻게 하라고 적어주는 글입니다. 4단계(역할-배경-지시-형식)로 구체적으로 적어줄수록 똑똑하게 일합니다." },
      { term: "컨텍스트 (Context)", metaphor: "비서가 꼭 알아야 할 회사 배경 팩트", desc: "누가, 누구에게, 왜 문서를 작성하는지 5W1H 배경 정보를 미리 주입하여 AI의 오해를 원천 차단합니다." },
      { term: "토큰 (Token)", metaphor: "AI가 계산하는 원고지 글자 수", desc: "AI가 글을 읽고 쓸 때 세는 기본 단위입니다. 한글 기준 약 1~2글자가 1토큰에 해당합니다." },
      { term: "아티팩트 (Artifacts)", metaphor: "대화창 옆에 펼쳐지는 투명 결재판", desc: "작성된 긴 문서나 표, 사업계획서를 대화와 분리하여 오른쪽 전용 창에 깔끔하게 보여주는 독립 뷰어입니다." }
    ],

    pptSlides: `[슬라이드 1] 표지: Claude와 함께하는 스마트 비즈니스 첫걸음
[슬라이드 2] Claude 3총사 완벽 비교: Claude.ai(웹 비서) vs Desktop(바탕화면 앱) vs Code(AI 엔지니어)
[슬라이드 3] Claude.ai로 만들 수 있는 비즈니스 산출물 5종 (문서, 표, 제안서, 법률검토, 아티팩트)
[슬라이드 4] 실패 없는 고품질 프롬프트 6대 설계 공식 (4대 기본기 + 2대 확장 규칙)
[슬라이드 5] 🛡️ LLM 서비스 프롬프트 사용 시 4대 필수 유의사항 (보안·팩트체크·모호성 배제·AI 윤리)
[슬라이드 6] [실습 1] Role 3단 조합 & Context 5W1H로 거래처 인사말 3가지 톤 뽑기
[슬라이드 7] [실습 2] 3페이지 분량 뉴스/칼럼 3줄 요약 및 표 변환하기
[슬라이드 8] AI 길들이기: 답변이 마음에 안 들 때 원클릭 피드백 (3줄 요약, 쉬운 말, 표 정리)
[슬라이드 9] [노션 연동] 오늘의 성공 프롬프트 나만의 업무 수첩에 저장하기`,

    pptScript: `[오프닝 래포 형성 멘트 (0~15분)]
"대표님들, 반갑습니다! 오늘부터 배울 Claude는 복잡한 컴퓨터 명령어가 전혀 필요 없습니다. 그냥 20년 차 똑똑한 신입사원 한 명 앉혀두고, '이것 좀 이렇게 해줘'라고 한국말로 심부름시키듯 지시하시면 됩니다."

[프롬프트 6대 공식 & 4대 유의사항 해설 멘트 (30~60분)]
"AI에게 '인사말 써줘'라고 하면 누구나 쓸 수 있는 뻔한 글이 나옵니다. 하지만:
1. Role: '너는 20년 경력의 대기업 비서실장(경력)이자 공문서 기획자(전문분야)이며 정중한 태도(태도)를 가졌어.'
2. Context: '우리는 친환경 농산물 유통 법인이고, 추석을 맞아 10년 단골 30곳 대표님께 보낼 거야.'
3. Instructions: '1단계 감사 ➔ 2단계 신제품 언급 ➔ 3단계 덕담'
4. Format: '공식형/카톡형/문자형 3가지로 나눠줘.'
이렇게 딱 짚어주면 Claude가 10초 만에 완벽한 3가지 글을 대령합니다!

⚠️ 단, 프롬프트 입력 시 4가지 안전 수칙을 꼭 기억하세요:
① 개인정보와 회사 기밀은 절대 금지(가명/마스킹 처리)!
② AI의 그럴듯한 거짓말(할루시네이션)은 법령/금액/통계 원문으로 팩트체크!
③ 모호한 지시는 모호한 답을 부르므로 5W1H 배경을 구체적으로 제공!
④ 타인의 저작물 무단 도용 금지 및 내 사업의 진정성을 담아 교정 사용!"`
  },

  2: {
    tag: "2회차 실습 룸",
    title: "창업 아이디어 구체화: 네이밍 5종 & 1-Page 사업계획서",
    sub: "내 머릿속에만 있던 창업 아이템을 전문적인 1-Page 사업계획서 표와 매력적인 사명으로 구체화합니다.",
    notionMission: "Claude가 도출한 법인명 후보 중 마음에 드는 2개와 1-Page 사업계획서 표를 복사하여 노션 <strong>[2회차 사업 기획 아카이브]</strong>에 저장하세요.",
    
    // [2일차 실습 1] 창업 아이디어 구체화 & 사명·슬로건 도출기
    practice1: {
      presets: [
        {
          label: "시니어 건강도시락",
          values: {
            idea: "혈당·혈압 조절이 필요한 6070 액티브 시니어를 위한 임상영양사 1:1 맞춤형 저염·저당 건강도시락 새벽 정기배송",
            experience: "25년간 대기업 단체급식 총괄 및 식품 품질위생 관리사 자격 보유, 1,000건 이상의 식단 영양 설계 노하우",
            painPoint: "당뇨/고혈압 환자는 매 끼니 저염 식단 조리가 번거롭고, 자녀들은 멀리 계신 부모님의 삼시 세끼 영양 불균형을 늘 걱정함",
            tone: "부모님을 모시는 자식의 마음을 담은 따뜻하고 신뢰감 넘치며 전문성이 느껴지는 품격 있는 프리미엄 톤"
          }
        },
        {
          label: "친환경 로컬푸드 직거래",
          values: {
            idea: "산지 수확 후 24시간 내 직배송되는 100% 생산자 실명제 친환경 유기농 농수산물 B2B/B2C 직거래 유통 플랫폼",
            experience: "20년 전국 농수산물 도매시장 경매사 및 산지 유통 물류 네트워크 구축 경력",
            painPoint: "소비자는 복잡한 유통 단계로 신선도가 떨어지고 비싼 가격을 치르며, 생산 농가는 제값을 받지 못하는 유통 마진 구조",
            tone: "정직함, 대자연의 싱그러움, 생산자의 땀방울과 신뢰가 느껴지는 친근하고 건강한 톤"
          }
        },
        {
          label: "신중년 전문직 자문 매칭",
          values: {
            idea: "대기업·금융권 퇴직 4050 전문직 인재와 전문 인력이 부족한 중소기업·스타트업을 연결하는 프로젝트형 파트타임 자문 플랫폼",
            experience: "30년 대기업 인사총괄(HR) 및 경영기획 상무 출신, 500명 이상의 시니어 전문가 인재 풀 보유",
            painPoint: "중소기업은 고임금 전문 임원을 정규직으로 채용하기 부담스럽고, 퇴직 전문직은 자신의 평생 경력을 살릴 일자리가 단절됨",
            tone: "격조 높은 전문성, 논리적 신뢰감, 상생의 가치가 돋보이는 모던 비즈니스 톤"
          }
        },
        {
          label: "무인 스마트 펫용품점",
          values: {
            idea: "24시간 AI 비전 인식 및 반려동물 체형별 맞춤 사료·용품 큐레이션 키오스크를 결합한 도심형 하이브리드 무인 펫 스토어",
            experience: "15년 프랜차이즈 유통 매장 운영 및 무인 IOT 시스템 관리 기술 경험",
            painPoint: "야간이나 공휴일에 급히 필요한 반려동물 용품 구입처가 부족하고, 일반 무인 매장은 제품 설명과 추천이 없어 선택이 어려움",
            tone: "반려동물에 대한 따뜻한 애정, 트렌디함, 스마트하고 편리한 혁신 톤"
          }
        }
      ],

      fields: [
        { id: "idea", label: "① 창업 희망 분야 & 대표 아이템", placeholder: "예: 혈당 조절 시니어 맞춤형 저염 건강도시락 새벽 정기배송", default: "혈당 조절 시니어 맞춤형 저염 건강도시락 새벽 정기배송" },
        { id: "experience", label: "② 창업자 보유 경력 & 핵심 전문 자산", placeholder: "예: 25년 대기업 단체급식 총괄 및 영양사 자격, 1,000건 식단 설계 경험", default: "25년 대기업 단체급식 총괄 및 영양사 자격, 1,000건 식단 설계 경험" },
        { id: "painPoint", label: "③ 타깃 고객이 겪는 핵심 불편함 (Pain-Point)", placeholder: "예: 매 끼니 저염 식단 조리가 번거롭고 부모님 건강 걱정이 큰 3040 자녀", default: "매 끼니 저염 식단 조리가 번거롭고 부모님 건강 걱정이 큰 3040 자녀" },
        { id: "tone", label: "④ 희망 브랜드 이미지 & 톤앤매너", placeholder: "예: 신뢰감, 따뜻한 효심, 전문 영양 케어가 느껴지는 프리미엄 비즈니스 톤", default: "신뢰감, 따뜻한 효심, 전문 영양 케어가 느껴지는 프리미엄 비즈니스 톤" }
      ],

      generatePrompt: (data, isHtml = false) => {
        const wrapVal = (val, fallback) => {
          const text = val || fallback;
          return isHtml ? `<span class="prompt-highlight-yellow">${escapeHtml(text)}</span>` : text;
        };

        const ideaVal = wrapVal(data.idea, '시니어 건강도시락 새벽배송');
        const expVal = wrapVal(data.experience, '25년 급식 및 영양 설계');
        const painVal = wrapVal(data.painPoint, '매끼 저염 조리 번거로움');
        const toneVal = wrapVal(data.tone, '신뢰, 따뜻함, 프리미엄');

        if (isHtml) {
          return `&lt;role&gt;\n너는 대한민국 최고의 "브랜드 네이밍 전문가"이자 특허청 상표권 심사 및 스타트업 브랜딩 디렉터야.\n&lt;/role&gt;\n\n` +
                 `&lt;context&gt;\n` +
                 `- 창업 희망 아이템: ${ideaVal}\n` +
                 `- 창업자 전문 경력 자산: ${expVal}\n` +
                 `- 타깃 고객 핵심 불편함: ${painVal}\n` +
                 `- 희망 브랜드 톤앤매너: ${toneVal}\n` +
                 `&lt;/context&gt;\n\n` +
                 `&lt;rules&gt;\n` +
                 `1. 제안하는 사명(법인명) 5개는 대법원 인터넷등기소 및 키프리스(KIPRIS) 상표권 등록 가능성이 높은 고유명사로 구성할 것.\n` +
                 `2. 한국어의 발음 편의성, 시각적 기억 용이성, 영문 표기 자연스러움을 검증할 것.\n` +
                 `3. 각 이름마다 ①네이밍 의미 ②영문 표기 ③브랜드 슬로건(1줄) ④타깃 고객에게 주는 핵심 가치를 명확히 제시할 것.\n` +
                 `&lt;/rules&gt;\n\n` +
                 `&lt;instructions&gt;\n` +
                 `창업자의 경력 자산과 타깃 고객의 고충을 관통하는 [추천 법인명 5종 및 슬로건]을 도출해 줘.\n` +
                 `다양성을 위해: 1)순우리말 감성형, 2)직관적 가치전달형, 3)글로벌/영문 결합형, 4)스토리텔링형, 5)전문 신뢰형으로 각각 1개씩 다채롭게 제안할 것.\n` +
                 `&lt;/instructions&gt;\n\n` +
                 `&lt;output_format&gt;\n` +
                 `## 🏆 추천 법인명 및 브랜드 슬로건 Top 5\n\n` +
                 `1. **[추천 사명 1]** (영문 표기) - *유형: 순우리말 감성형*\n` +
                 `   - 🎯 **슬로건**: "..."\n` +
                 `   - 💡 **네이밍 의미**: ...\n` +
                 `   - 💎 **핵심 고객 가치**: ...\n\n` +
                 `2. **[추천 사명 2]** (영문 표기) - *유형: 직관적 가치전달형*\n` +
                 `   (동일 서식 반복)\n` +
                 `&lt;/output_format&gt;`;
        }

        return `<role>\n너는 대한민국 최고의 "브랜드 네이밍 전문가"이자 특허청 상표권 심사 및 스타트업 브랜딩 디렉터야.\n</role>\n\n` +
               `<context>\n` +
               `- 창업 희망 아이템: ${ideaVal}\n` +
               `- 창업자 전문 경력 자산: ${expVal}\n` +
               `- 타깃 고객 핵심 불편함: ${painVal}\n` +
               `- 희망 브랜드 톤앤매너: ${toneVal}\n` +
               `</context>\n\n` +
               `<rules>\n` +
               `1. 제안하는 사명(법인명) 5개는 대법원 인터넷등기소 및 키프리스(KIPRIS) 상표권 등록 가능성이 높은 고유명사로 구성할 것.\n` +
               `2. 한국어의 발음 편의성, 시각적 기억 용이성, 영문 표기 자연스러움을 검증할 것.\n` +
               `3. 각 이름마다 ①네이밍 의미 ②영문 표기 ③브랜드 슬로건(1줄) ④타깃 고객에게 주는 핵심 가치를 명확히 제시할 것.\n` +
               `</rules>\n\n` +
               `<instructions>\n` +
               `창업자의 경력 자산과 타깃 고객의 고충을 관통하는 [추천 법인명 5종 및 슬로건]을 도출해 줘.\n` +
               `다양성을 위해: 1)순우리말 감성형, 2)직관적 가치전달형, 3)글로벌/영문 결합형, 4)스토리텔링형, 5)전문 신뢰형으로 각각 1개씩 다채롭게 제안할 것.\n` +
               `</instructions>\n\n` +
               `<output_format>\n` +
               `## 🏆 추천 법인명 및 브랜드 슬로건 Top 5\n\n` +
               `1. **[추천 사명 1]** (영문 표기) - *유형: 순우리말 감성형*\n` +
               `   - 🎯 **슬로건**: "..."\n` +
               `   - 💡 **네이밍 의미**: ...\n` +
               `   - 💎 **핵심 고객 가치**: ...\n\n` +
               `2. **[추천 사명 2]** (영문 표기) - *유형: 직관적 가치전달형*\n` +
               `   (동일 서식 반복)\n` +
               `</output_format>`;
      }
    },

    // [2일차 실습 2] 창업진흥원 표준 1-Page 사업계획서 표 생성기
    practice2: {
      presets: [
        {
          label: "시니어 건강도시락",
          values: {
            businessName: "(주)효도한상 / 프리미엄 시니어 맞춤 영양 식단 새벽 정기배송",
            target: "수도권 거주 당뇨·고혈압 식단 관리가 필요한 6070 액티브 시니어 및 타지에 사는 3040 직장인 자녀 (초기 목표: 500가구)",
            solutions: "①임상영양사 1:1 상담 기반 맞춤 식단 처방\n②당일 새벽 조리 당일 직배송 원칙\n③저염·저당 특허 조리법 및 친환경 보냉 용기 회수 시스템",
            revenueModel: "월 20회(주 5일) 정기구독료(35만 원) + 맞춤형 건강기능식품 큐레이션 번들 판매 (목표 마진율: 32%)",
            marketingPlan: "지역 보건소/복지관 연계 무료 건강식단 세미나 개최, 네이버 '부모님 효도 선물' 키워드 타깃 광고, 카카오톡 알림톡 기반 매일 식단 리포트 발송"
          }
        },
        {
          label: "친환경 로컬푸드 직거래",
          values: {
            businessName: "(주)싱싱한다이렉트 / 산지 직송 24시간 친환경 농수산물 B2B 유통",
            target: "신선한 프리미엄 식자재를 필요로 하는 수도권 레스토랑, 베이커리 300곳 및 건강 지향 4050 주부",
            solutions: "①산지 수확 후 24시간 내 배송 보장\n②100% 생산자 실명제 및 품질보증 리콜제\n③탄소 배출 절감 재사용 에코 박스 배송망",
            revenueModel: "B2B 도매 공급 마진(15~20%) 및 B2C 정기 제철 채소 꾸러미 멤버십 연회비(5만 원)",
            marketingPlan: "유명 셰프 및 로컬 파트너 레스토랑 인증 마크 부여, 와디즈/텀블벅 크라우드펀딩 런칭, 인스타그램 산지 직송 라이브 커머스"
          }
        },
        {
          label: "신중년 전문직 자문 매칭",
          values: {
            businessName: "(주)파트너스프로 / 퇴직 전문직과 성장기 중소기업 프로젝트 자문 매칭",
            target: "전문 경영·재무·해외영업 인력이 부족한 연매출 50억~200억 규모 중소기업 1,000개사",
            solutions: "①주 1~2일 파트타임 자문으로 정규직 대비 70% 비용 절감\n②30년 대기업 현장 실무 노하우 직접 투입\n③성과 연동형 마일스톤 계약 안전장치",
            revenueModel: "전문가 매칭 성공 수수료(계약금의 10%) + 월간 프로젝트 관리 SaaS 이용료(월 15만 원)",
            marketingPlan: "중소기업중앙회 및 이노비즈협회 제휴 세미나, 링크드인 B2B 타깃 아웃바운드 영업, 성공 자문 사례 백서 배포"
          }
        },
        {
          label: "무인 스마트 펫용품점",
          values: {
            businessName: "(주)펫스마트케어 / 24시 AI 맞춤 큐레이션 무인 반려동물 복합 스토어",
            target: "1인가구 및 맞벌이 2040 반려인 밀집 도심 주거단지 거주자",
            solutions: "①AI 카메라 체형/품종 스캔을 통한 맞춤 사료 3초 추천\n②24시간 긴급 위생용품/응급 약품 밴딩머신\n③무인 매장 안전 이상행동 자동 감지 관제",
            revenueModel: "반려동물 용품 및 프리미엄 사료 판매 마진(35~45%) + 가맹점 로열티 및 키오스크 솔루션 월 사용료",
            marketingPlan: "지역 당근마켓 로컬 광고, 반려견 동반 방문 시 샘플 간식 무료 증정 이벤트, 네이버 플레이스 리뷰 챌린지"
          }
        }
      ],

      fields: [
        { id: "businessName", label: "① 확정 사명(법인명) & 대표 아이템", placeholder: "예: (주)효도한상 / 시니어 맞춤 저염 건강도시락 정기배송", default: "(주)효도한상 / 시니어 맞춤 저염 건강도시락 정기배송" },
        { id: "target", label: "② 핵심 타깃 시장 & 고객 페르소나", placeholder: "예: 식단 관리가 필요한 6070 액티브 시니어 및 3040 직장인 자녀", default: "식단 관리가 필요한 6070 액티브 시니어 및 3040 직장인 자녀" },
        { id: "solutions", label: "③ 경쟁사 대비 핵심 차별화 솔루션 3가지", placeholder: "예: 1.영양사 1:1 맞춤 식단 2.당일 새벽 직배송 3.저염 특허 조리법", default: "1. 영양사 1:1 맞춤 식단 처방\n2. 당일 새벽 조리 당일 직배송 원칙\n3. 저염·저당 특허 조리법 및 친환경 보냉 용기" },
        { id: "revenueModel", label: "④ 가격 및 지속 수익 모델 (BM / 매출 구조)", placeholder: "예: 월 20회 정기구독료(35만 원) + 건기식 번들 판매 (마진율 30%)", default: "월 20회 정기구독료(35만 원) + 건기식 번들 판매 (마진율 30%)" },
        { id: "marketingPlan", label: "⑤ 초기 6개월 마케팅 및 실행 전략", placeholder: "예: 보건소/복지관 세미나, 네이버 키워드 광고, 카카오톡 식단 리포트", default: "보건소/복지관 세미나, 네이버 효도선물 키워드 광고, 카카오톡 식단 리포트" }
      ],

      generatePrompt: (data, isHtml = false) => {
        const wrapVal = (val, fallback) => {
          const text = val || fallback;
          return isHtml ? `<span class="prompt-highlight-yellow">${escapeHtml(text)}</span>` : text;
        };

        const nameVal = wrapVal(data.businessName, '(주)효도한상');
        const targetVal = wrapVal(data.target, '6070 시니어');
        const solVal = wrapVal(data.solutions, '영양사 1:1 상담');
        const revVal = wrapVal(data.revenueModel, '월 35만 원 구독');
        const mktVal = wrapVal(data.marketingPlan, '지역 보건소 연계');

        if (isHtml) {
          return `&lt;role&gt;\n너는 중소벤처기업부 및 창업진흥원의 "공인 창업 심사위원"이자 수석 컨설턴트야.\n&lt;/role&gt;\n\n` +
                 `&lt;context&gt;\n` +
                 `- 사업명 및 아이템: ${nameVal}\n` +
                 `- 타깃 시장 및 고객: ${targetVal}\n` +
                 `- 핵심 차별화 솔루션: ${solVal}\n` +
                 `- 수익 모델 및 가격: ${revVal}\n` +
                 `- 초기 마케팅 전략: ${mktVal}\n` +
                 `&lt;/context&gt;\n\n` +
                 `&lt;rules&gt;\n` +
                 `1. 정부지원사업(예비창업패키지, 초기창업패키지) 및 금융기관 심사위원이 1분 안에 읽고 통과시킬 수 있도록 완벽한 마크다운 표(Table)로 작성할 것.\n` +
                 `2. 두루뭉술한 수식어를 배제하고, 구체적인 수치(목표 고객 수, 마진율, 실행 기간)와 개조식(-) 문장으로 기술할 것.\n` +
                 `3. [PSST 표준 모델: 문제인식-실현가능성-성장전략-팀역량]의 5대 핵심 항목을 완벽히 포괄할 것.\n` +
                 `&lt;/rules&gt;\n\n` +
                 `&lt;instructions&gt;\n` +
                 `아래 제공된 1-Page 사업계획서 표준 서식에 맞춰 심사용 고품질 사업계획서 요약본을 작성해 줘.\n` +
                 `&lt;/instructions&gt;\n\n` +
                 `&lt;output_format&gt;\n` +
                 `## 📊 [정부지원사업 표준] 1-Page 사업계획서 요약본\n\n` +
                 `| 항목 | 세부 핵심 전략 및 실행 방안 |\n` +
                 `| :--- | :--- |\n` +
                 `| **1. 사업명** | ${nameVal} |\n` +
                 `| **2. 문제 인식 (Problem)** | • 기존 시장의 한계 및 미충족 수요 3가지<br>• 타깃 고객의 결정적 고통(Pain-Point) |\n` +
                 `| **3. 타깃 시장 (Market)** | • 1차 타깃 고객 페르소나 및 목표 가구/기업 수<br>• 시장 규모 및 확장 가능성 |\n` +
                 `| **4. 해결 방안 (Solution)** | • 독창적 차별화 솔루션 3가지 (특허/기술/노하우)<br>• 경쟁사 대비 압도적 비교 우위 |\n` +
                 `| **5. 비즈니스 모델 (BM)** | • 가격 책정 및 주요 매출 파이프라인<br>• 예상 원가율, 마진율 및 손익분기점(BEP) 시점 |\n` +
                 `| **6. 마케팅 & 성장 (Growth)** | • 초기 100명 고객 획득 온·오프라인 채널 전략<br>• 6개월 단계별 핵심 마일스톤 로드맵 |\n` +
                 `| **7. 팀 역량 & 리스크 (Team)** | • 대표자의 20~30년 전문 경력/네트워크 활용 방안<br>• 법률/인허가 규제 대응 및 안전 가드레일 |\n` +
                 `&lt;/output_format&gt;`;
        }

        return `<role>\n너는 중소벤처기업부 및 창업진흥원의 "공인 창업 심사위원"이자 수석 컨설턴트야.\n</role>\n\n` +
               `<context>\n` +
               `- 사업명 및 아이템: ${nameVal}\n` +
               `- 타깃 시장 및 고객: ${targetVal}\n` +
               `- 핵심 차별화 솔루션: ${solVal}\n` +
               `- 수익 모델 및 가격: ${revVal}\n` +
               `- 초기 마케팅 전략: ${mktVal}\n` +
               `</context>\n\n` +
               `<rules>\n` +
               `1. 정부지원사업(예비창업패키지, 초기창업패키지) 및 금융기관 심사위원이 1분 안에 읽고 통과시킬 수 있도록 완벽한 마크다운 표(Table)로 작성할 것.\n` +
               `2. 두루뭉술한 수식어를 배제하고, 구체적인 수치(목표 고객 수, 마진율, 실행 기간)와 개조식(-) 문장으로 기술할 것.\n` +
               `3. [PSST 표준 모델: 문제인식-실현가능성-성장전략-팀역량]의 5대 핵심 항목을 완벽히 포괄할 것.\n` +
               `</rules>\n\n` +
               `<instructions>\n` +
               `아래 제공된 1-Page 사업계획서 표준 서식에 맞춰 심사용 고품질 사업계획서 요약본을 작성해 줘.\n` +
               `</instructions>\n\n` +
               `<output_format>\n` +
               `## 📊 [정부지원사업 표준] 1-Page 사업계획서 요약본\n\n` +
               `| 항목 | 세부 핵심 전략 및 실행 방안 |\n` +
               `| :--- | :--- |\n` +
               `| **1. 사업명** | ${nameVal} |\n` +
               `| **2. 문제 인식 (Problem)** | • 기존 시장의 한계 및 미충족 수요 3가지<br>• 타깃 고객의 결정적 고통(Pain-Point) |\n` +
               `| **3. 타깃 시장 (Market)** | • 1차 타깃 고객 페르소나 및 목표 가구/기업 수<br>• 시장 규모 및 확장 가능성 |\n` +
               `| **4. 해결 방안 (Solution)** | • 독창적 차별화 솔루션 3가지 (특허/기술/노하우)<br>• 경쟁사 대비 압도적 비교 우위 |\n` +
               `| **5. 비즈니스 모델 (BM)** | • 가격 책정 및 주요 매출 파이프라인<br>• 예상 원가율, 마진율 및 손익분기점(BEP) 시점 |\n` +
               `| **6. 마케팅 & 성장 (Growth)** | • 초기 100명 고객 획득 온·오프라인 채널 전략<br>• 6개월 단계별 핵심 마일스톤 로드맵 |\n` +
               `| **7. 팀 역량 & 리스크 (Team)** | • 대표자의 20~30년 전문 경력/네트워크 활용 방안<br>• 법률/인허가 규제 대응 및 안전 가드레일 |\n` +
               `</output_format>`;
      }
    },

    checklist: [
      "창업 아이디어의 타깃 고객과 고충(Pain-Point)을 구체적으로 도출했다.",
      "Claude가 제안한 법인명 5개 중 의미가 통하는 후보 2개를 선별했다.",
      "PSST 5대 항목이 포함된 1-Page 사업계획서 요약본 표를 완성했다.",
      "도출된 사업계획서 표를 노션 [2회차: 사업 기획 아카이브]에 저장했다."
    ],

    // 2일차 수업 마무리 핵심 AI 용어 3분 톡
    glossary: [
      { term: "할루시네이션 (Hallucination)", metaphor: "모르면서 아는 척하는 그럴듯한 지어내기", desc: "AI가 통계나 숫자를 모를 때 그럴듯하게 거짓말을 만드는 현상입니다. 사업계획서의 법령이나 시장 수치는 꼭 확인해야 합니다." },
      { term: "프로젝트 (Projects)", metaphor: "우리 회사 전용 지능형 서류 캐비닛", desc: "회사 소개서나 정관을 한 번만 올려두면, 매번 설명하지 않아도 AI가 그 서류를 기억하고 문서를 작성해 줍니다." },
      { term: "가드레일 (Guardrail)", metaphor: "AI가 딴길로 새지 않게 막는 안전 울타리", desc: "프롬프트의 <rules> 태그처럼 '전문용어 금지, 본문만 즉시 작성' 등 AI의 오답을 막는 안전 규칙입니다." },
      { term: "BM (Business Model)", metaphor: "내 사업의 지속 가능한 수익 지도", desc: "누구에게(타깃), 무엇을(솔루션), 어떤 방식으로 팔아(수익구조) 돈을 벌 것인가를 정의하는 사업의 뼈대입니다." }
    ],

    pptSlides: `[슬라이드 1] 2회차: 법인 설립의 시작, 비즈니스 모델 구체화\n[슬라이드 2] 좋은 사명과 슬로건이 사업의 절반이다 (네이밍 프롬프트)\n[슬라이드 3] 시장 조사 및 경쟁사 SWOT 분석을 AI로 5분 만에 끝내기\n[슬라이드 4] 정부지원사업 및 투자유치를 위한 1-Page 사업계획서 5대 필수 항목\n[슬라이드 5] [실습 1] 내 아이템에 맞는 법인명 & 슬로건 5종 도출\n[슬라이드 6] [실습 2] 1-Page 표준 사업계획서 표 형태로 자동 생성\n[슬라이드 7] [노션 연동] 사업계획서 아카이빙 및 향후 로드맵 정리`,

    pptScript: `[강의 포인트 (0~25분)]\n"대표님들, 머릿속에 좋은 사업 아이디어는 많은데 이걸 한 장짜리 문서로 정리하려고 하면 막막하셨죠? 오늘 Claude에게 내 아이템 키워드 몇 개만 넣어주면, 공공기관이나 은행에 제출해도 손색없는 깔끔한 표 형태의 사업계획서 초안이 1분 만에 완성됩니다."`
  }
};

// 모의 실습 데이터 (1~2일차)
const MOCK_DATA = {
  1: `[1일차 실습용: 모의 거래처 인사말 상황]
- 회사명: (주)한결솔루션 (대표: 김한결)
- 수신처: 10년 이상 함께해 온 주요 거래처 20곳 대표이사님
- 내용: 올 한 해 보내주신 신뢰에 대한 감사, 추석 명절 덕담, 4분기 신제품 출시 소식 살짝 언급
- 요청 톤: 정중하고 깊이 있는 예의를 갖춘 300자 내외 문구`,

  2: `[2일차 실습용: 프리미엄 시니어 도시락 창업 아이디어 메모]
- 아이템명: 100세 활력 시니어 맞춤형 영양 식단 정기배송 (가칭: 효도한상)
- 타깃층: 당뇨·고혈압 식단 관리가 필요한 6070 액티브 시니어 및 타지에 사는 3040 직장인 자녀
- 핵심 차별점: 전문 임상영양사 1:1 상담, 당일 새벽 저염·저당 특허 조리, 보냉 친환경 용기 배송
- 희망 수익 모델: 월 20회 정기구독(30만 원) 및 맞춤형 건강기능식품 번들 판매`
};

// 중장년 눈높이 용어사전
const GLOSSARY_DATA = [
  { term: "프롬프트 (Prompt)", metaphor: "신입 비서에게 주는 업무 지시서", desc: "AI에게 무엇을 어떻게 하라고 적어주는 글입니다. 4단계(역할-배경-지시-형식)로 적어주면 똑똑하게 일합니다." },
  { term: "토큰 (Token)", metaphor: "원고지 글자 수", desc: "AI가 글을 읽고 쓸 때 세는 기본 단위입니다. 한글 기준 대략 1글자~2글자가 1토큰에 해당합니다." },
  { term: "컨텍스트 윈도우 (Context Window)", metaphor: "비서의 책상 크기 (단기 기억력)", desc: "AI가 대화 중에 한 번에 기억할 수 있는 문서의 양입니다. Claude는 책 1~2권 분량도 한 번에 기억합니다." },
  { term: "아티팩트 (Artifacts)", metaphor: "대화창 옆에 놓인 투명 결재판", desc: "작성된 긴 문서나 표, 코드를 대화와 분리하여 오른쪽 별도 창에 깔끔하게 보여주는 기능입니다." },
  { term: "할루시네이션 (Hallucination)", metaphor: "모르는데 아는 척하는 지어내기", desc: "AI가 모르는 질문을 받았을 때 그럴듯하게 거짓말을 만들어내는 현상입니다. 사실 확인이 꼭 필요합니다." },
  { term: "프로젝트 (Projects)", metaphor: "우리 회사 전용 서류 캐비닛", desc: "회사 소개서나 정관을 한 번만 올려두면, 매번 설명하지 않아도 AI가 그 서류를 기억하고 문서를 작성합니다." }
];

// ==========================================================================
// 2. 상태 관리 (State)
// ==========================================================================
const BASE_DOC_TITLE = "Claude를 활용한 스마트 창업 & 비즈니스 활용 허브";
let currentSession = 1;         // 1, 2

// ==========================================================================
// 3. DOM 요소 참조
// ==========================================================================
const sessionTabs = document.querySelectorAll(".nav-tab");

// 1일차 가이드 카드 & 워크스테이션
const claudeTrioCard = document.getElementById("claudeTrioCard");
const promptMasterCard = document.getElementById("promptMasterCard");
const precautionsCard = document.getElementById("precautionsCard");
const practiceWorkspaceSession1 = document.getElementById("practiceWorkspaceSession1");

// 2일차 가이드 카드 & 듀얼 워크스테이션
const session2BmCard = document.getElementById("session2BmCard");
const session2PlanFormulaCard = document.getElementById("session2PlanFormulaCard");
const practiceWorkspaceSession2_1 = document.getElementById("practiceWorkspaceSession2_1");
const practiceWorkspaceSession2_2 = document.getElementById("practiceWorkspaceSession2_2");

const btnPrintA4 = document.getElementById("btnPrintA4");

// 토스트
const toastNotification = document.getElementById("toastNotification");
let toastTimeoutId = null;

// ==========================================================================
// 4. 초기화 & 이벤트 리스너 등록
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initSessionTabs();
  initNotionButtons();
  initHelperButtons();
  initCopyButtons();
  initOutputModal();
  renderSessionContent(currentSession);
});

// 토스트 알림 함수
function showToast(message, duration = 3000) {
  if (!toastNotification) return;
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }
  toastNotification.textContent = message || "클립보드에 복사되었습니다!";
  toastNotification.style.display = "block";
  toastTimeoutId = setTimeout(() => {
    toastNotification.style.display = "none";
    toastTimeoutId = null;
  }, duration);
}

// 클립보드 복사 유틸리티
function copyToClipboard(text, customMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(customMsg || "클립보드에 복사되었습니다! Claude 대화창에 [Ctrl + V]로 붙여넣으세요.");
  }).catch(() => {
    showToast("복사에 실패했습니다. 직접 선택하여 복사해 주세요.");
  });
}

/**
 * 현재 회차의 워크시트 전체 내용을 노션 마크다운 형식으로 생성 (1일차 & 2일차 듀얼 워크스테이션 완벽 대응)
 * @param {number} sessionNum - 현재 회차 번호
 * @returns {string} 마크다운 문자열
 */
function generateNotionWorksheetMarkdown(sessionNum) {
  const data = SESSIONS_DATA[sessionNum];
  if (!data) return "";

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let md = `# 📒 [${sessionNum}일차 실습 아카이브] ${data.title}\n\n`;
  md += `> 📅 **저장 일시**: ${dateStr}\n`;
  md += `> 🎯 **핵심 주제**: ${data.sub}\n\n`;
  md += `---\n\n`;

  if (sessionNum === 1) {
    // [1일차] 입력 내용 & 완성 프롬프트
    md += `## 📝 1. 내가 작성한 워크시트 기획 내용\n\n`;
    if (data.fields && data.fields.length > 0) {
      data.fields.forEach((f) => {
        const inputEl = document.getElementById(`input_${f.id}`);
        const val = inputEl ? inputEl.value.trim() : f.default;
        const cleanLabel = f.label.split(" - ")[0];
        if (val.includes("\n")) {
          md += `- **${cleanLabel}**:\n`;
          val.split("\n").forEach((line) => {
            if (line.trim()) md += `  > ${line}\n`;
          });
        } else {
          md += `- **${cleanLabel}**: ${val}\n`;
        }
      });
    }
    md += `\n---\n\n`;

    const outputBox = document.getElementById("generatedPromptOutput");
    const promptContent = outputBox ? outputBox.textContent.trim() : "";
    md += `## 🤖 2. 실습 완성 프롬프트 (Claude 작업 지시서)\n\n`;
    md += `\`\`\`xml\n${promptContent}\n\`\`\`\n\n`;
    md += `---\n\n`;

  } else if (sessionNum === 2) {
    // [2일차 실습 1] 창업 아이디어 & 사명·슬로건 도출기
    md += `## 💡 1. [실습 1] 창업 아이디어 & 네이밍 기획 내용\n\n`;
    if (data.practice1 && data.practice1.fields) {
      data.practice1.fields.forEach((f) => {
        const inputEl = document.getElementById(`input_p1_${f.id}`);
        const val = inputEl ? inputEl.value.trim() : f.default;
        const cleanLabel = f.label.split(" & ")[0];
        if (val.includes("\n")) {
          md += `- **${cleanLabel}**:\n`;
          val.split("\n").forEach((line) => {
            if (line.trim()) md += `  > ${line}\n`;
          });
        } else {
          md += `- **${cleanLabel}**: ${val}\n`;
        }
      });
    }
    md += `\n`;

    const outputBox2_1 = document.getElementById("generatedPromptOutput2_1");
    const promptContent2_1 = outputBox2_1 ? outputBox2_1.textContent.trim() : "";
    md += `### 🤖 [실습 1] 법인명 5종 & 슬로건 도출 프롬프트\n\n`;
    md += `\`\`\`xml\n${promptContent2_1}\n\`\`\`\n\n`;
    md += `---\n\n`;

    // [2일차 실습 2] 1-Page 표준 사업계획서 표 생성기
    md += `## 📊 2. [실습 2] 1-Page 사업계획서 5대 핵심 기획\n\n`;
    if (data.practice2 && data.practice2.fields) {
      data.practice2.fields.forEach((f) => {
        const inputEl = document.getElementById(`input_p2_${f.id}`);
        const val = inputEl ? inputEl.value.trim() : f.default;
        const cleanLabel = f.label.split(" & ")[0];
        if (val.includes("\n")) {
          md += `- **${cleanLabel}**:\n`;
          val.split("\n").forEach((line) => {
            if (line.trim()) md += `  > ${line}\n`;
          });
        } else {
          md += `- **${cleanLabel}**: ${val}\n`;
        }
      });
    }
    md += `\n`;

    const outputBox2_2 = document.getElementById("generatedPromptOutput2_2");
    const promptContent2_2 = outputBox2_2 ? outputBox2_2.textContent.trim() : "";
    md += `### 🤖 [실습 2] 1-Page 표준 사업계획서 표 생성 프롬프트\n\n`;
    md += `\`\`\`xml\n${promptContent2_2}\n\`\`\`\n\n`;
    md += `---\n\n`;
  }

  // 3. 자가 점검표 체크 상태
  if (data.checklist && data.checklist.length > 0) {
    md += `## ✅ 오늘의 자가 점검표\n\n`;
    data.checklist.forEach((item, idx) => {
      const chk = document.getElementById(`chk_${sessionNum}_${idx}`);
      const isChecked = chk && chk.checked;
      md += `- [${isChecked ? "x" : " "}] ${item}\n`;
    });
    md += `\n---\n\n`;
  }

  // 4. 오늘의 핵심 AI 용어 3분 톡
  if (data.glossary && data.glossary.length > 0) {
    md += `## 📖 오늘의 핵심 AI 용어 요약\n\n`;
    data.glossary.forEach((item) => {
      md += `* **${item.term}** (💡 ${item.metaphor})\n  - ${item.desc}\n`;
    });
    md += `\n---\n\n`;
  }

  md += `> 📌 *이 아카이브는 Claude 비즈니스 실습 허브에서 원클릭으로 생성되었습니다. 노션 페이지에 그대로 보관하세요!*`;

  return md;
}

/**
 * 노션 연동 버튼 클릭 이벤트 초기화 (클립보드 자동 복사 + 노션 열기)
 */
function initNotionButtons() {
  const btnBottomNotion = document.getElementById("btnBottomNotion");
  const btnHeaderNotion = document.getElementById("btnHeaderNotion");

  const handleNotionClick = (e) => {
    e.preventDefault();
    const notionMarkdown = generateNotionWorksheetMarkdown(currentSession);

    navigator.clipboard.writeText(notionMarkdown).then(() => {
      showToast(`📋 [${currentSession}일차 워크시트] 복사 완료! 노션에서 [Ctrl + V]를 누르세요.`, 4000);
      setTimeout(() => {
        window.open("https://notion.so", "_blank", "noopener,noreferrer");
      }, 350);
    }).catch(() => {
      showToast("노션 페이지로 이동합니다.", 3000);
      window.open("https://notion.so", "_blank", "noopener,noreferrer");
    });
  };

  if (btnBottomNotion) {
    btnBottomNotion.addEventListener("click", handleNotionClick);
  }
  if (btnHeaderNotion) {
    btnHeaderNotion.addEventListener("click", handleNotionClick);
  }
}

/**
 * 프롬프트 원클릭 복사 버튼 초기화 (1일차 원본 ID 복원)
 */
function initCopyButtons() {
  const btnCopy1 = document.getElementById("btnCopyGeneratedPrompt");
  const btnCopy2_1 = document.getElementById("btnCopyGeneratedPrompt2_1");
  const btnCopy2_2 = document.getElementById("btnCopyGeneratedPrompt2_2");

  if (btnCopy1) {
    btnCopy1.addEventListener("click", () => {
      const box = document.getElementById("generatedPromptOutput");
      if (box) copyToClipboard(box.textContent.trim(), "📋 1일차 완성 프롬프트가 복사되었습니다! Claude에 붙여넣으세요.");
    });
  }

  if (btnCopy2_1) {
    btnCopy2_1.addEventListener("click", () => {
      const box = document.getElementById("generatedPromptOutput2_1");
      if (box) copyToClipboard(box.textContent.trim(), "📋 [실습 1] 사명·슬로건 도출 프롬프트가 복사되었습니다! Claude에 붙여넣으세요.");
    });
  }

  if (btnCopy2_2) {
    btnCopy2_2.addEventListener("click", () => {
      const box = document.getElementById("generatedPromptOutput2_2");
      if (box) copyToClipboard(box.textContent.trim(), "📋 [실습 2] 1-Page 사업계획서 프롬프트가 복사되었습니다! Claude에 붙여넣으세요.");
    });
  }
}

// 피드백 헬퍼 추가 내역 보관 객체 (회차별 헬퍼 요청사항 누적 관리)
const addedHelperAppends = { "1": [], "2_1": [], "2_2": [] };

/**
 * 피드백 헬퍼 버튼 초기화 (원클릭 보정 프롬프트 추가)
 */
function initHelperButtons() {
  const helperButtons = document.querySelectorAll(".btn-helper");
  helperButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const appendText = btn.getAttribute("data-append");
      const target = btn.getAttribute("data-target") || "1";

      if (appendText && !addedHelperAppends[target].includes(appendText)) {
        addedHelperAppends[target].push(appendText);
        if (target === "1") {
          updateGeneratedPrompt();
        } else if (target === "2_1") {
          updateGeneratedPrompt2_1();
        } else if (target === "2_2") {
          updateGeneratedPrompt2_2();
        }
        showToast(`⚡ '${btn.textContent.trim()}' 요청문이 프롬프트 하단에 추가되었습니다!`);
      } else if (appendText && addedHelperAppends[target].includes(appendText)) {
        showToast(`이미 추가된 요청사항입니다.`);
      }
    });
  });
}

// 텍스트에어리어 내용에 맞춰 높이 자동 조절
function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.max(el.scrollHeight + 2, 44) + "px";
}

// ==========================================================================
// 5. 회차 탭 전환 로직
// ==========================================================================
function initSessionTabs() {
  sessionTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      sessionTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentSession = parseInt(tab.getAttribute("data-tab").replace("session", ""), 10);
      renderSessionContent(currentSession);
    });
  });
}

// ==========================================================================
// 6. 회차별 콘텐츠 렌더링 (1일차 vs 2일차 전용 가이드 & 워크스테이션 토글)
// ==========================================================================
function renderSessionContent(sessionNum) {
  const data = SESSIONS_DATA[sessionNum];
  if (!data) return;

  // 1일차 전용 요소 토글
  if (claudeTrioCard) claudeTrioCard.style.display = (sessionNum === 1) ? "block" : "none";
  if (promptMasterCard) promptMasterCard.style.display = (sessionNum === 1) ? "block" : "none";
  if (precautionsCard) precautionsCard.style.display = (sessionNum === 1) ? "block" : "none";
  if (practiceWorkspaceSession1) practiceWorkspaceSession1.style.display = (sessionNum === 1) ? "block" : "none";

  // 2일차 전용 요소 토글
  if (session2BmCard) session2BmCard.style.display = (sessionNum === 2) ? "block" : "none";
  if (session2PlanFormulaCard) session2PlanFormulaCard.style.display = (sessionNum === 2) ? "block" : "none";
  if (practiceWorkspaceSession2_1) practiceWorkspaceSession2_1.style.display = (sessionNum === 2) ? "block" : "none";
  if (practiceWorkspaceSession2_2) practiceWorkspaceSession2_2.style.display = (sessionNum === 2) ? "block" : "none";

  // 1. 문서 타이틀 및 수강생 헤더 영역 갱신
  document.title = `${BASE_DOC_TITLE}_${sessionNum}회차`;
  document.getElementById("currentSessionTag").textContent = data.tag;
  document.getElementById("currentSessionHeading").textContent = data.title;
  document.getElementById("currentSessionSub").textContent = data.sub;
  document.getElementById("notionMissionText").innerHTML = data.notionMission;

  if (btnPrintA4) {
    btnPrintA4.title = `[${sessionNum}회차] 교재 및 워크시트 바로 인쇄`;
  }

  // 2. 워크스테이션 폼 필드 렌더링
  if (sessionNum === 1) {
    renderSession1Fields(data);
  } else if (sessionNum === 2) {
    renderSession2Fields(data);
  }

  // 3. 오늘 수업 마무리 핵심 AI 용어 3분 톡 렌더링
  const dailyGlossaryContainer = document.getElementById("dailyGlossaryGrid");
  if (dailyGlossaryContainer && data.glossary) {
    dailyGlossaryContainer.innerHTML = "";
    data.glossary.forEach(item => {
      const card = document.createElement("div");
      card.className = "glossary-card";
      card.innerHTML = `
        <div class="glossary-term">${item.term}</div>
        <div class="glossary-metaphor">💡 직관적 비유: "${item.metaphor}"</div>
        <div class="glossary-desc">${item.desc}</div>
      `;
      dailyGlossaryContainer.appendChild(card);
    });
  }
}

/**
 * 1일차 단일 워크스테이션 폼 렌더링 (원래 1일차 원본 구현 복원)
 */
function renderSession1Fields(data) {
  const formContainer = document.getElementById("builderFormFields");
  if (!formContainer) return;
  formContainer.innerHTML = "";

  // 프리셋 버튼
  if (data.presets && data.presets.length > 0) {
    const presetBox = document.createElement("div");
    presetBox.className = "preset-wrapper";
    presetBox.innerHTML = `
      <span class="preset-title">⚡ 빠른 예시 불러오기:</span>
      <div class="preset-buttons">
        ${data.presets.map((p, idx) => `<button type="button" class="btn-preset" data-idx="${idx}">${p.label}</button>`).join('')}
      </div>
    `;
    formContainer.appendChild(presetBox);

    presetBox.querySelectorAll(".btn-preset").forEach(pBtn => {
      pBtn.addEventListener("click", (e) => {
        const pIdx = parseInt(e.target.getAttribute("data-idx"), 10);
        const selectedPreset = data.presets[pIdx];
        if (selectedPreset) {
          Object.keys(selectedPreset.values).forEach(key => {
            const inputEl = document.getElementById(`input_${key}`);
            if (inputEl) {
              inputEl.value = selectedPreset.values[key];
              autoResizeTextarea(inputEl);
            }
          });
          updateGeneratedPrompt();
          showToast(`'${selectedPreset.label}' 예시가 입력창에 적용되었습니다!`);
        }
      });
    });
  }

  // 입력 필드들
  data.fields.forEach(field => {
    const group = document.createElement("div");
    group.className = "builder-field-group";
    group.innerHTML = `
      <label for="input_${field.id}">${field.label}</label>
      <textarea id="input_${field.id}" class="builder-input builder-textarea" rows="2" placeholder="${field.placeholder}">${field.default}</textarea>
    `;
    formContainer.appendChild(group);

    const textareaEl = group.querySelector("textarea");
    textareaEl.addEventListener("input", () => {
      autoResizeTextarea(textareaEl);
      updateGeneratedPrompt();
    });
    setTimeout(() => autoResizeTextarea(textareaEl), 0);
  });

  // 자가 점검표
  if (data.checklist && data.checklist.length > 0) {
    const checkCard = document.createElement("div");
    checkCard.className = "interactive-checklist-box";
    checkCard.innerHTML = `
      <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 8px; color: #1e293b;">✅ 오늘의 자가 점검표 (Checklist)</h4>
      <div class="checklist-items">
        ${data.checklist.map((item, i) => `
          <label class="check-item-label">
            <input type="checkbox" id="chk_1_${i}">
            <span>${item}</span>
          </label>
        `).join('')}
      </div>
    `;
    formContainer.appendChild(checkCard);
  }

  updateGeneratedPrompt();
}

/**
 * 2일차 듀얼 워크스테이션 폼 렌더링 (실습 1: 사명/슬로건 & 실습 2: 1-Page 사업계획서)
 */
function renderSession2Fields(data) {
  // --- [실습 1 폼 렌더링] ---
  const container1 = document.getElementById("builderFormFields2_1");
  if (container1 && data.practice1) {
    container1.innerHTML = "";

    // 실습 1 프리셋
    if (data.practice1.presets && data.practice1.presets.length > 0) {
      const presetBox1 = document.createElement("div");
      presetBox1.className = "preset-wrapper";
      presetBox1.innerHTML = `
        <span class="preset-title">⚡ 빠른 예시 불러오기:</span>
        <div class="preset-buttons">
          ${data.practice1.presets.map((p, idx) => `<button type="button" class="btn-preset" data-idx="${idx}">${p.label}</button>`).join('')}
        </div>
      `;
      container1.appendChild(presetBox1);

      presetBox1.querySelectorAll(".btn-preset").forEach(pBtn => {
        pBtn.addEventListener("click", (e) => {
          const pIdx = parseInt(e.target.getAttribute("data-idx"), 10);
          const selectedPreset = data.practice1.presets[pIdx];
          if (selectedPreset) {
            Object.keys(selectedPreset.values).forEach(key => {
              const inputEl = document.getElementById(`input_p1_${key}`);
              if (inputEl) {
                inputEl.value = selectedPreset.values[key];
                autoResizeTextarea(inputEl);
              }
            });
            updateGeneratedPrompt2_1();
            showToast(`[실습 1] '${selectedPreset.label}' 예시가 적용되었습니다!`);
          }
        });
      });
    }

    // 실습 1 필드들
    data.practice1.fields.forEach(field => {
      const group = document.createElement("div");
      group.className = "builder-field-group";
      group.innerHTML = `
        <label for="input_p1_${field.id}">${field.label}</label>
        <textarea id="input_p1_${field.id}" class="builder-input builder-textarea" rows="2" placeholder="${field.placeholder}">${field.default}</textarea>
      `;
      container1.appendChild(group);

      const textareaEl = group.querySelector("textarea");
      textareaEl.addEventListener("input", () => {
        autoResizeTextarea(textareaEl);
        updateGeneratedPrompt2_1();
      });
      setTimeout(() => autoResizeTextarea(textareaEl), 0);
    });

    updateGeneratedPrompt2_1();
  }

  // --- [실습 2 폼 렌더링] ---
  const container2 = document.getElementById("builderFormFields2_2");
  if (container2 && data.practice2) {
    container2.innerHTML = "";

    // 실습 2 프리셋
    if (data.practice2.presets && data.practice2.presets.length > 0) {
      const presetBox2 = document.createElement("div");
      presetBox2.className = "preset-wrapper";
      presetBox2.innerHTML = `
        <span class="preset-title">⚡ 빠른 예시 불러오기:</span>
        <div class="preset-buttons">
          ${data.practice2.presets.map((p, idx) => `<button type="button" class="btn-preset" data-idx="${idx}">${p.label}</button>`).join('')}
        </div>
      `;
      container2.appendChild(presetBox2);

      presetBox2.querySelectorAll(".btn-preset").forEach(pBtn => {
        pBtn.addEventListener("click", (e) => {
          const pIdx = parseInt(e.target.getAttribute("data-idx"), 10);
          const selectedPreset = data.practice2.presets[pIdx];
          if (selectedPreset) {
            Object.keys(selectedPreset.values).forEach(key => {
              const inputEl = document.getElementById(`input_p2_${key}`);
              if (inputEl) {
                inputEl.value = selectedPreset.values[key];
                autoResizeTextarea(inputEl);
              }
            });
            updateGeneratedPrompt2_2();
            showToast(`[실습 2] '${selectedPreset.label}' 예시가 적용되었습니다!`);
          }
        });
      });
    }

    // 실습 2 필드들
    data.practice2.fields.forEach(field => {
      const group = document.createElement("div");
      group.className = "builder-field-group";
      group.innerHTML = `
        <label for="input_p2_${field.id}">${field.label}</label>
        <textarea id="input_p2_${field.id}" class="builder-input builder-textarea" rows="2" placeholder="${field.placeholder}">${field.default}</textarea>
      `;
      container2.appendChild(group);

      const textareaEl = group.querySelector("textarea");
      textareaEl.addEventListener("input", () => {
        autoResizeTextarea(textareaEl);
        updateGeneratedPrompt2_2();
      });
      setTimeout(() => autoResizeTextarea(textareaEl), 0);
    });

    // 2일차 자가 점검표
    if (data.checklist && data.checklist.length > 0) {
      const checkCard = document.createElement("div");
      checkCard.className = "interactive-checklist-box";
      checkCard.innerHTML = `
        <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 8px; color: #1e293b;">✅ 2일차 자가 점검표 (Checklist)</h4>
        <div class="checklist-items">
          ${data.checklist.map((item, i) => `
            <label class="check-item-label">
              <input type="checkbox" id="chk_2_${i}">
              <span>${item}</span>
            </label>
          `).join('')}
        </div>
      `;
      container2.appendChild(checkCard);
    }

    updateGeneratedPrompt2_2();
  }
}

/**
 * 1일차 프롬프트 실시간 생성 (노란색 텍스트 하이라이트 반영)
 */
function updateGeneratedPrompt() {
  const data = SESSIONS_DATA[1];
  if (!data) return;

  const currentValues = {};
  data.fields.forEach(field => {
    const el = document.getElementById(`input_${field.id}`);
    currentValues[field.id] = el ? el.value : "";
  });

  const generatedHtml = data.generatePrompt(currentValues, true);
  const outputBox = document.getElementById("generatedPromptOutput");
  if (outputBox) {
    let finalHtml = generatedHtml;
    if (addedHelperAppends["1"] && addedHelperAppends["1"].length > 0) {
      finalHtml += `\n\n[추가 요청사항]\n` + addedHelperAppends["1"].map(t => `<span class="prompt-highlight-yellow">${escapeHtml(t)}</span>`).join("\n");
    }
    outputBox.innerHTML = finalHtml;
  }
}

/**
 * 2일차 실습 1 (사명/슬로건) 프롬프트 실시간 생성 (노란색 텍스트 하이라이트 반영)
 */
function updateGeneratedPrompt2_1() {
  const data = SESSIONS_DATA[2];
  if (!data || !data.practice1) return;

  const currentValues = {};
  data.practice1.fields.forEach(field => {
    const el = document.getElementById(`input_p1_${field.id}`);
    currentValues[field.id] = el ? el.value : "";
  });

  const generatedHtml = data.practice1.generatePrompt(currentValues, true);
  const outputBox = document.getElementById("generatedPromptOutput2_1");
  if (outputBox) {
    let finalHtml = generatedHtml;
    if (addedHelperAppends["2_1"] && addedHelperAppends["2_1"].length > 0) {
      finalHtml += `\n\n[추가 요청사항]\n` + addedHelperAppends["2_1"].map(t => `<span class="prompt-highlight-yellow">${escapeHtml(t)}</span>`).join("\n");
    }
    outputBox.innerHTML = finalHtml;
  }
}

/**
 * 2일차 실습 2 (1-Page 사업계획서 표) 프롬프트 실시간 생성 (노란색 텍스트 하이라이트 반영)
 */
function updateGeneratedPrompt2_2() {
  const data = SESSIONS_DATA[2];
  if (!data || !data.practice2) return;

  const currentValues = {};
  data.practice2.fields.forEach(field => {
    const el = document.getElementById(`input_p2_${field.id}`);
    currentValues[field.id] = el ? el.value : "";
  });

  const generatedHtml = data.practice2.generatePrompt(currentValues, true);
  const outputBox = document.getElementById("generatedPromptOutput2_2");
  if (outputBox) {
    let finalHtml = generatedHtml;
    if (addedHelperAppends["2_2"] && addedHelperAppends["2_2"].length > 0) {
      finalHtml += `\n\n[추가 요청사항]\n` + addedHelperAppends["2_2"].map(t => `<span class="prompt-highlight-yellow">${escapeHtml(t)}</span>`).join("\n");
    }
    outputBox.innerHTML = finalHtml;
  }
}



// ==========================================================================
// 10. 교재 및 실물 워크시트 인쇄 엔진 (1일차 1페이지 / 2일차 2페이지 분할 완벽 대응)
// ==========================================================================
const STANDARD_PROMPTS = {
  1: `너는 20년 경력의 "베테랑 비서실장"이야.
[상황] 다가오는 명절을 앞두고 주요 거래처 대표님들께 보낼 감사 인사말을 써야 해.
[지시] 너무 가볍지 않고 품격과 신뢰가 느껴지는 문장으로 작성해 줘.
[형식] 3가지 버전(①공식 서한형 ②친근한 카톡형 ③짧은 문자형)으로 출력해 줘.`,

  2: {
    practice1: `<role> 너는 대한민국 최고의 "브랜드 네이밍 전문가"이자 상표권 심사 디렉터야. </role>
<context>
- 창업 아이템: 시니어 맞춤형 저염 건강도시락 새벽 정기배송
- 창업자 경력: 25년 대기업 단체급식 총괄 및 영양사 자격, 1,000건 식단 설계 경험
- 타깃 고충: 매 끼니 저염 식단 조리가 번거롭고 부모님 건강 걱정이 큰 3040 자녀
- 브랜드 톤: 신뢰감, 따뜻한 효심, 전문 영양 케어가 느껴지는 프리미엄 톤
</context>
<instructions>
상표권 등록 가능성이 높은 [추천 법인명 5종 및 슬로건]을 도출해 줘. (순우리말/직관형/글로벌/스토리/신뢰형 각 1개)
</instructions>`,

    practice2: `<role> 너는 중소벤처기업부 및 창업진흥원 공인 "창업 심사위원"이자 수석 컨설턴트야. </role>
<context>
- 사업명: (주)효도한상 / 프리미엄 시니어 맞춤 저염 건강도시락 새벽 정기배송
- 타깃 시장: 수도권 거주 식단 관리가 필요한 6070 액티브 시니어 및 3040 직장인 자녀
- 핵심 솔루션: 1)임상영양사 1:1 맞춤 식단 처방 2)당일 새벽 직배송 3)저염 특허 조리법
- 수익 모델: 월 20회 정기구독료(35만 원) + 건기식 번들 판매 (목표 마진율 32%)
- 마케팅: 보건소/복지관 세미나, 네이버 효도선물 키워드 광고, 카카오톡 식단 리포트
</context>
<instructions>
PSST 표준 항목(문제인식-실현가능성-성장전략-팀역량)에 맞춘 [1-Page 사업계획서 요약본]을 마크다운 표(Table)로 작성해 줘.
</instructions>`
  }
};

if (btnPrintA4) {
  btnPrintA4.addEventListener("click", () => {
    const printContainer = document.getElementById("printableWorksheet");
    const data = SESSIONS_DATA[currentSession];
    
    if (printContainer && data) {
      if (currentSession === 1) {
        // [1일차 워크시트] 단일 1페이지 인쇄
        const standardPromptText = STANDARD_PROMPTS[1];

        printContainer.innerHTML = `
          <div class="print-worksheet-page">
            <div class="print-sheet-header">
              <div>
                <span class="print-badge">[워크시트 1호]</span>
                <h2 class="print-sheet-title">${data.title}</h2>
                <p class="print-course-sub">과정명: Claude로 시작하는 스마트 창업 & 비즈니스 활용 (1회차)</p>
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">1. Claude 제품군 3총사 한눈에 꿰뚫기</h3>
              <div class="print-trio-grid">
                <div class="print-trio-card highlight-main">
                  <div class="print-trio-header">
                    <span class="print-trio-badge">초·중급자 강추 ⭐⭐⭐⭐⭐</span>
                    <strong class="print-trio-name">🌐 Claude.ai (웹/모바일)</strong>
                  </div>
                  <div class="print-trio-metaphor">"온라인 사무실 비서"</div>
                  <p class="print-trio-desc">인터넷 창만 열면 어디서나 즉시 접속. 아티팩트 및 문서 관리 기본 탑재.</p>
                </div>
                <div class="print-trio-card">
                  <div class="print-trio-header">
                    <span class="print-trio-badge">중급자 추천 ⭐⭐⭐⭐</span>
                    <strong class="print-trio-name">🖥️ Claude Desktop (앱)</strong>
                  </div>
                  <div class="print-trio-metaphor">"바탕화면 전담 비서"</div>
                  <p class="print-trio-desc">PC 설치형 앱, 단축키 호출. 내 컴퓨터 안의 로컬 파일/도구 연결 (MCP 지원).</p>
                </div>
                <div class="print-trio-card">
                  <div class="print-trio-header">
                    <span class="print-trio-badge">전문가용 ⭐⭐</span>
                    <strong class="print-trio-name">👨‍💻 Claude Code (CLI)</strong>
                  </div>
                  <div class="print-trio-metaphor">"AI 시스템 개발자"</div>
                  <p class="print-trio-desc">터미널 검은 화면에서 코드를 직접 작성/수정/배포하는 소프트웨어 엔지니어 도구.</p>
                </div>
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">2. 나의 비즈니스 맞춤 핵심 키워드 정리 (손글씨 작성란)</h3>
              <div class="print-fill-grid">
                ${data.fields.map((f, idx) => {
                  const labels1 = [
                    { ko: "① AI에게 맡길 역할", en: "(Role)" },
                    { ko: "② 현재 상황 및 배경", en: "(Context)" },
                    { ko: "③ 구체적 지시사항", en: "(Instructions)" },
                    { ko: "④ 원하는 출력 형태", en: "(Format)" }
                  ];
                  const item = labels1[idx] || { ko: f.label.split(' - ')[0], en: "" };
                  return `
                    <div class="print-fill-item">
                      <div class="print-fill-label">
                        <span class="label-ko">${item.ko}</span>
                        <span class="label-en">${item.en}</span>
                      </div>
                      <span class="print-fill-colon">:</span>
                      <div class="print-fill-lines-box">
                        <div class="print-fill-line"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">3. Claude에 입력할 완성 지시문 (표준 예시)</h3>
              <div class="print-prompt-box">${standardPromptText}</div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">4. 📖 오늘 수업 핵심 AI 용어 3분 정리 (직관적 비유)</h3>
              <div class="print-glossary-box">
                ${data.glossary ? data.glossary.map((g, gIdx) => {
                  const nums = ["①", "②", "③", "④"];
                  return `
                    <div class="print-glossary-row">
                      <div class="print-glossary-term-wrap">
                        <span class="print-glossary-num">${nums[gIdx] || (gIdx + 1)}</span>
                        <strong class="print-glossary-term">${g.term}</strong>
                      </div>
                      <span class="print-glossary-colon">:</span>
                      <div class="print-glossary-desc-wrap">
                        <span class="print-glossary-metaphor">"${g.metaphor}"</span>
                        <span class="print-glossary-desc">${g.desc}</span>
                      </div>
                    </div>
                  `;
                }).join('') : ''}
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">5. 오늘의 15분 노션 아카이빙 미션 체크리스트</h3>
              <div class="print-check-box">
                ${data.checklist ? data.checklist.map(c => `
                  <div class="print-check-item">□ ${c}</div>
                `).join('') : '<div class="print-check-item">□ 오늘 생성된 결과물을 노션 보관함에 복사·저장했습니다.</div>'}
              </div>
            </div>
          </div>
        `;
      } else if (currentSession === 2) {
        // [2일차 워크시트] 2페이지 완벽 분할 인쇄 (Page 1: 사명/슬로건 & BM | Page 2: 1-Page 사업계획서 & PSST)
        const prompt1Text = STANDARD_PROMPTS[2].practice1;
        const prompt2Text = STANDARD_PROMPTS[2].practice2;

        printContainer.innerHTML = `
          <!-- ================= [2일차 워크시트 1페이지: 실습 1] ================= -->
          <div class="print-worksheet-page">
            <div class="print-sheet-header">
              <div>
                <span class="print-badge">[워크시트 2-1호] 창업 아이디어 & 사명·슬로건 도출 (1/2 페이지)</span>
                <h2 class="print-sheet-title">창업 아이디어 구체화 및 법인명·브랜드 슬로건 5종 도출</h2>
                <p class="print-course-sub">과정명: Claude로 시작하는 스마트 창업 & 비즈니스 활용 (2회차 실습 1)</p>
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">1. 비즈니스 모델(BM) 5대 핵심 축 요약 (창업 뼈대 설계)</h3>
              <div class="print-bm-grid">
                <div class="print-bm-card">
                  <strong>① 타깃 페르소나</strong>
                  <span>누구의 불편함인가</span>
                </div>
                <div class="print-bm-card">
                  <strong>② 가치 제안</strong>
                  <span>어떤 해결책인가</span>
                </div>
                <div class="print-bm-card">
                  <strong>③ 수익 모델</strong>
                  <span>어떻게 돈을 버는가</span>
                </div>
                <div class="print-bm-card">
                  <strong>④ 유통/마케팅</strong>
                  <span>어떤 채널로 알릴까</span>
                </div>
                <div class="print-bm-card">
                  <strong>⑤ 창업자 경력</strong>
                  <span>나만의 전문성/자산</span>
                </div>
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">2. [실습 1] 창업 아이디어 & 네이밍 손글씨 작성란</h3>
              <div class="print-fill-grid">
                ${data.practice1.fields.map((f, idx) => `
                  <div class="print-fill-item">
                    <div class="print-fill-label">
                      <span class="label-ko">${f.label.split(' & ')[0]}</span>
                    </div>
                    <span class="print-fill-colon">:</span>
                    <div class="print-fill-lines-box">
                      <div class="print-fill-line"></div>
                      ${idx > 0 ? '<div class="print-fill-line"></div>' : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">3. [실습 1] 사명·슬로건 Claude 표준 지시문 (예시 프롬프트)</h3>
              <div class="print-prompt-box">${prompt1Text}</div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">4. 📖 오늘 수업 핵심 AI 용어 3분 정리 (직관적 비유)</h3>
              <div class="print-glossary-box">
                ${data.glossary ? data.glossary.map((g, gIdx) => {
                  const nums = ["①", "②", "③", "④"];
                  return `
                    <div class="print-glossary-row">
                      <div class="print-glossary-term-wrap">
                        <span class="print-glossary-num">${nums[gIdx] || (gIdx + 1)}</span>
                        <strong class="print-glossary-term">${g.term}</strong>
                      </div>
                      <span class="print-glossary-colon">:</span>
                      <div class="print-glossary-desc-wrap">
                        <span class="print-glossary-metaphor">"${g.metaphor}"</span>
                        <span class="print-glossary-desc">${g.desc}</span>
                      </div>
                    </div>
                  `;
                }).join('') : ''}
              </div>
            </div>
          </div>

          <!-- ================= [2일차 워크시트 2페이지: 실습 2] ================= -->
          <div class="print-worksheet-page">
            <div class="print-sheet-header">
              <div>
                <span class="print-badge">[워크시트 2-2호] 창업진흥원 표준 1-Page 사업계획서 (2/2 페이지)</span>
                <h2 class="print-sheet-title">정부지원사업 표준 1-Page 사업계획서 표 요약본 완성</h2>
                <p class="print-course-sub">과정명: Claude로 시작하는 스마트 창업 & 비즈니스 활용 (2회차 실습 2)</p>
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">1. PSST 표준 4대 프레임워크 핵심 요약 (정부지원사업/투자 심사 표준)</h3>
              <div class="print-psst-grid">
                <div class="print-psst-card">
                  <strong>① P (문제 인식)</strong>
                  <span>시장 한계 & 고객 Pain-Point</span>
                </div>
                <div class="print-psst-card">
                  <strong>② S (실현 가능성)</strong>
                  <span>차별화 솔루션 & 개발 실현 방안</span>
                </div>
                <div class="print-psst-card">
                  <strong>③ S (성장 전략)</strong>
                  <span>수익 모델(BM) & 고객 획득 로드맵</span>
                </div>
                <div class="print-psst-card">
                  <strong>④ T (팀 역량)</strong>
                  <span>대표자 전문 경력 & 리스크 관리</span>
                </div>
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">2. [실습 2] 1-Page 사업계획서 5대 핵심 항목 손글씨 작성란</h3>
              <div class="print-fill-grid">
                ${data.practice2.fields.map((f, idx) => `
                  <div class="print-fill-item">
                    <div class="print-fill-label">
                      <span class="label-ko">${f.label.split(' & ')[0]}</span>
                    </div>
                    <span class="print-fill-colon">:</span>
                    <div class="print-fill-lines-box">
                      <div class="print-fill-line"></div>
                      ${idx > 0 ? '<div class="print-fill-line"></div>' : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">3. [실습 2] 1-Page 사업계획서 표 Claude 표준 지시문 (예시 프롬프트)</h3>
              <div class="print-prompt-box">${prompt2Text}</div>
            </div>

            <div class="print-section">
              <h3 class="print-sec-title">4. 오늘의 15분 노션 아카이빙 미션 체크리스트 & 2회차 자가 점검표</h3>
              <div class="print-check-box">
                ${data.checklist ? data.checklist.map(c => `
                  <div class="print-check-item">□ ${c}</div>
                `).join('') : '<div class="print-check-item">□ 오늘 생성된 결과물을 노션 보관함에 복사·저장했습니다.</div>'}
              </div>
            </div>
          </div>
        `;
      }
    }

    // PDF 저장 시 기본 파일명 및 브라우저 인쇄 머리글로 자동 지정되는 문서 타이틀 설정
    document.title = `${BASE_DOC_TITLE}_${currentSession}회차`;

    // 인쇄 대화상자 호출
    window.print();
  });
}

// ==========================================================================
// 11. Claude.ai 산출물 5종 예시 프롬프트 데이터 & 팝업 모달 엔진 (1일차 & 2일차 10종 완전판)
// ==========================================================================
const OUTPUT_PROMPTS_DATA = {
  // --- [1일차 산출물 5종] ---
  1: {
    badge: "1일차 산출물 1호",
    title: "비즈니스 텍스트 (인사말 / 공문 / 이메일)",
    desc: "명절 감사 인사말, 거래처 공문서, 고객 안내문, 이메일 회신문 등 격식과 품격을 갖춘 3가지 톤의 실무 텍스트를 즉시 생성합니다.",
    format: "멀티 톤 3종 분할 (공식 서한형 / 카카오톡형 / 모바일 간결형)",
    prompt: `<role>
너는 20년 경력의 대기업 비서실장이자 B2B 소통 전문 기획자(정중하고 품격 있는 태도)야.
</role>

<context>
- 발신자: 친환경 농산물 유통 법인 '한결푸드'
- 수신자: 10년 이상 거래한 주요 파트너사 대표이사 30분
- 상황: 추석 명절 감사 인사 및 4분기 제철 신제품 출하 소식 안내
</context>

<rules>
1. 불필요한 사족("안녕하세요" 등) 없이 완성된 본문만 즉시 작성할 것.
2. 품격 있는 한국어 비즈니스 경어체를 사용할 것.
3. 요청한 3가지 버전으로 명확히 제목을 달아 구분하여 출력할 것.
</rules>

<instructions>
1단계: 올 한 해 신뢰와 협력에 대한 깊은 감사를 전할 것.
2단계: 가을 제철 신제품 출시 소식을 1줄 자연스럽게 덧붙일 것.
3단계: 명절 덕담과 건강을 기원하며 정중히 마무리할 것.
</instructions>

<output_format>
### 1. 정중한 공식 서한형 (공문/이메일용)
(본문)

### 2. 따뜻하고 친근한 관계형 (카카오톡용)
(본문)

### 3. 핵심만 담은 모바일 간결형 (150자 이내 문자용)
(본문)
</output_format>`,
    preview: `### 1. 정중한 공식 서한형 (공문/이메일용)
안녕하십니까, 주식회사 한결푸드 대표이사 김한결입니다.
올 한 해도 변함없는 신뢰와 따뜻한 성원으로 당사와 함께해 주신 대표님과 귀사 임직원 여러분께 진심으로 깊은 감사의 말씀을 올립니다. 아울러 다가오는 4분기에는 산지의 정성을 가득 담은 '친환경 가을 특산물 선물세트'를 새롭게 선보이오니 많은 관심 부탁드립니다. 풍요로운 한가위를 맞아 댁내 두루 평안과 행복이 깃드시기를 기원합니다.

### 2. 따뜻하고 친근한 관계형 (카카오톡용)
대표님, 올 한 해도 한결푸드를 믿고 든든한 파트너가 되어주셔서 진심으로 감사드립니다! 풍성한 수확의 계절을 맞아 당사에서도 4분기 친환경 가을 제철 신제품을 정성껏 준비했습니다. 이번 추석 연휴 동안 사랑하는 가족분들과 보름달처럼 넉넉하고 따뜻한 명절 보내시길 바랍니다. 늘 건강하십시오!

### 3. 핵심만 담은 모바일 간결형 (150자 이내 문자용)
[한결푸드] 대표님, 올 한 해 보내주신 성원에 깊이 감사드립니다. 풍요로운 추석 명절 보내시고 귀사의 무궁한 번창을 기원합니다. (4분기 제철 특산물 신제품도 곧 찾아뵙겠습니다.)`
  },

  2: {
    badge: "1일차 산출물 2호",
    title: "구조화된 분석표 (SWOT / 시장조사 / 비교표)",
    desc: "창업 아이템의 시장 경쟁력 분석, 경쟁사 SWOT 분석, 가격 및 기능 비교표 등 한눈에 들어오는 마크다운 표(Table)를 자동 생성합니다.",
    format: "마크다운 표 (구분 / 핵심 내용 / 시사점 / 전략 실행안)",
    prompt: `<role>
너는 삼일PwC 출신의 "경영전략 및 시장조사 수석 컨설턴트"야.
</role>

<context>
- 업종: 시니어 맞춤 저염 건강도시락 새벽 정기배송
- 시장 배경: 초고령화 가속화 및 액티브 시니어 증가, 대기업 밀키트 업계 진입
</context>

<rules>
1. 추상적인 문장 대신 구체적인 팩트와 실행 전략 위주로 작성할 것.
2. 모든 분석 결과는 관공서 및 투자기관 보고용 마크다운 표(Table)로 출력할 것.
</rules>

<instructions>
시니어 맞춤 건강도시락 사업의 [경쟁력 SWOT 분석표]와 [경쟁사 비교표]를 작성해 줘.
</instructions>

<output_format>
| 구분 | 핵심 내용 | 비즈니스 전략적 시사점 |
| :--- | :--- | :--- |
(내용 표 구성)
</output_format>`,
    preview: `| 구분 | 핵심 분석 내용 | 비즈니스 전략적 시사점 |
| :--- | :--- | :--- |
| **강점 (Strengths)** | • 임상영양사 1:1 맞춤 식단 설계<br>• 당일 새벽 조리 당일 배송 원칙 | 전문성과 신선도를 결합하여 높은 고객 락인(Lock-in) 확보 |
| **약점 (Weaknesses)** | • 초기 콜드체인 물류망 구축 비용 부담 | 권역별 전문 새벽배송 대행사와 제휴하여 고정비 최소화 |
| **기회 (Opportunities)** | • 5070 액티브 시니어 증가<br>• 3040 직장인 자녀의 부모님 선물 수요 | 자녀 타깃 인스타그램/네이버 광고 및 효도 구독 상품 패키징 |
| **위협 (Threats)** | • 대형 식품 대기업의 실버푸드 시장 진입 | 대량 생산이 불가능한 '1:1 건강 상담' 밀착 서비스로 차별화 |`
  },

  3: {
    badge: "1일차 산출물 3호",
    title: "1-Page 사업계획서 / 제안서",
    desc: "정부지원사업(중기부/창진원) 심사 및 금융기관 대출용 표준 1-Page 사업계획서 요약본을 완성도 높은 표와 개조식 목록으로 도출합니다.",
    format: "1-Page 표준 마크다운 표 + 개조식 실행 로드맵",
    prompt: `<role>
너는 중소벤처기업부 및 창업진흥원 공인 "창업 컨설턴트"이자 브랜딩 디렉터야.
</role>

<context>
- 창업 아이템: 시니어 맞춤형 영양 식단 새벽 정기배송 (가칭: 효도한상)
- 타깃 고객: 혈당/혈압 관리가 필요한 50~70대 시니어 및 부모님을 챙기는 3040 자녀
- 핵심 강점: 임상영양사 1:1 상담, 당일 새벽 조리 배송, 저염·저당 특허 조리
- 주요 수익: 월 30만 원 정기구독료 및 맞춤형 건강기능식품 연계 판매
</context>

<rules>
1. 공공기관 심사위원이 1분 안에 이해할 수 있도록 마크다운 표(Table)로 구성할 것.
2. 문제점과 해결책(Solution)을 명확하게 1:1로 대응시킬 것.
</rules>

<instructions>
[미션 1] 추천 법인명 후보 5종 및 슬로건 도출
[미션 2] 창진원 표준 항목에 맞춘 [1-Page 사업계획서 요약본] 표 작성
</instructions>

<output_format>
## 🏆 추천 법인명 Top 5
(목록)

## 📊 1-Page 표준 사업계획서 요약본
| 구분 | 핵심 내용 및 실행 전략 |
| :--- | :--- |
(표 구성)
</output_format>`,
    preview: `## 🏆 추천 법인명 Top 5
1. **(주)효도한상** (HyodoHansang) - *"부모님의 건강한 매일을 새벽에 배송합니다"*
2. **(주)케어테이블** (CareTable) - *"영양사가 설계하는 100세 맞춤 식탁"*

## 📊 1-Page 표준 사업계획서 요약본
| 구분 | 핵심 내용 및 실행 전략 |
| :--- | :--- |
| **사업명** | 액티브 시니어 맞춤형 저염·영양 식단 새벽 정기배송 플랫폼 |
| **추진 배경** | 시니어 만성질환자 급증 및 맞벌이 자녀의 부모님 식단 케어 어려움 해소 |
| **타깃 시장** | 수도권 50~70대 식단 관리가 필요한 1,000가구 (초기 거점 집중) |
| **핵심 솔루션** | 임상영양사 1:1 데이터 맞춤 설계 + 당일 새벽 직배송 + 친환경 용기 |
| **수익 모델** | 월 30만 원(주 5일 새벽배송) 정기구독료 + 맞춤 건기식 큐레이션 마진 |
| **마케팅 전략** | 지역 복지관/시니어 클럽 체험단 운영, 네이버 '부모님 효도선물' 키워드 공략 |`
  },

  4: {
    badge: "1일차 산출물 4호",
    title: "계약서 독소조항 Before & After 비교표",
    desc: "외주 용역 계약서, 공급 계약서, 임대차 계약서 검토 시 일방적으로 불리한 독소조항을 적발하고 법적 근거 기반의 수정 대안을 표로 제시합니다.",
    format: "1:1 대비 마크다운 표 (조항 / 원본 리스크 / 문제점 / 안전 수정안)",
    prompt: `<role>
너는 20년 경력의 "기업 법무 및 B2B 계약 전문 변호사"야.
</role>

<context>
- 계약 유형: 소프트웨어 외주 개발 및 유지보수 표준 계약서
- 당사 입장: 외주 개발을 의뢰하는 발주사 (중소기업)
</context>

<rules>
1. 일방적인 지체상금, 비밀유지 위반 과다 위약벌, 지식재산권 귀속 불공정 조항을 적발할 것.
2. 실무에서 바로 수정 요구할 수 있는 현실적인 조항 수정안을 제시할 것.
</rules>

<instructions>
제공된 계약서 조항을 검토하고 [독소조항 Before & After 비교표]를 작성해 줘.
</instructions>

<output_format>
| 조항 번호 | 원본 조항 (Risk) | 문제점 및 법적 리스크 | 수정 권고안 (Safe) |
| :--- | :--- | :--- | :--- |
(비교표 작성)
</output_format>`,
    preview: `| 조항 번호 | 원본 조항 (Risk) | 문제점 및 법적 리스크 | 수정 권고안 (Safe) |
| :--- | :--- | :--- | :--- |
| **제7조 (손해배상)** | "을의 과실로 손해가 발생할 시 모든 직·간접 손해를 무제한 배상한다." | 간접손해/특별손해까지 무제한 배상 시 회사 경영권에 치명적 리스크 | "배상 책임 한도는 본 계약 총금액을 초과할 수 없으며, 통상손해에 한한다." |
| **제12조 (지체상금)** | "납기 지체 1일당 총 계약금의 1.0%를 공제한다." | 법정 기준(0.075~0.125%) 대비 10배 이상 과도한 불공정 약관 | "국가계약법 시행령에 준하여 지체 1일당 0.075%로 공제율을 합리화한다." |
| **제15조 (지식재산권)** | "개발 과정에서 생성된 모든 산출물의 지식재산권은 갑에게 단독 귀속된다." | 을의 기존 핵심 원천 기술까지 갑에게 부당 양도될 위험 | "을이 기존에 보유하던 원천 프레임워크 기술은 을의 소유로 보존한다." |`
  },

  5: {
    badge: "1일차 산출물 5호",
    title: "아티팩트(Artifacts) 독립 시각화 문서",
    desc: "대화창을 벗어나 오른쪽 전용 뷰어에 HTML 반응형 랜딩페이지, SVG 다이어그램, 인터랙티브 대시보드 코드를 자동 렌더링합니다.",
    format: "단일 HTML/SVG 아티팩트 독립 문서 (반응형 웹)",
    prompt: `<role>
너는 현대적인 UI/UX 디자이너이자 웹 프론트엔드 전문 개발자야.
</role>

<context>
- 프로젝트: '효도한상' 시니어 건강도시락 원페이지 반응형 랜딩페이지 프로토타입
- 타깃: 스마트폰을 사용하는 5060 액티브 시니어 및 부모님을 챙기는 3040 직장인 자녀
</context>

<rules>
1. Claude Artifacts 전용 창에 즉시 렌더링되도록 단일 HTML 파일(내부 CSS/JS 포함)로 작성할 것.
2. 5060 시니어를 위해 18px 이상의 시원한 폰트, 높은 명도 대비, 큼직한 버튼을 적용할 것.
3. [1:1 영양사 상담 신청], [새벽배송 정기구독 신청] 인터랙티브 폼을 포함할 것.
</rules>

<instructions>
세련된 모바일 반응형 웹 랜딩페이지 전체 소스 코드를 작성해 줘.
포함 섹션:
① 상단 헤더 & 브랜드 로고
② 히어로 비주얼 (새벽 조리 강조 & 1-클릭 상담 신청)
③ 저염/당뇨 맞춤 식단 3종 카드
④ 실제 이용 고객 생생 후기
⑤ 월간 정기구독 요금제 비교표
</instructions>

<output_format>
\`\`\`html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>효도한상 - 100세 맞춤 영양 식탁</title>
  <style>/* 고대비 시니어 친화 스타일 */</style>
</head>
<body>
  <!-- 완성된 웹페이지 UI -->
</body>
</html>
\`\`\`
</output_format>`,
    preview: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>효도한상 - 시니어 맞춤 건강도시락</title>
  <style>
    body { font-family: sans-serif; font-size: 18px; line-height: 1.6; color: #111827; }
    .hero { background: #fffbeb; padding: 40px 20px; text-align: center; border-radius: 12px; }
    .btn-primary { background: #c25e30; color: #fff; padding: 14px 28px; font-size: 20px; font-weight: bold; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>"부모님의 건강한 하루, 새벽 식탁에서 시작됩니다"</h1>
    <p>임상영양사가 1:1 설계하는 저염·저당 프리미엄 건강도시락</p>
    <button class="btn-primary">🥗 1:1 무료 맞춤 상담 신청하기</button>
  </div>
</body>
</html>`
  },

  // --- [2일차 전용 산출물 5종] ---
  "2_1": {
    badge: "2일차 산출물 1호",
    title: "법인명 후보 5종 & 브랜드 슬로건",
    desc: "대법원 인터넷등기소 상호 중복 방지 및 키프리스 상표권 등록 친화적인 고유 법인명 5개와 감성·직관 슬로건을 자동 도출합니다.",
    format: "Top 5 목록 (사명 / 영문 / 슬로건 / 네이밍 의미 / 핵심 가치)",
    prompt: `<role>
너는 대한민국 최고의 "스타트업 브랜딩 디렉터"이자 상표권 전문 네이밍 컨설턴트야.
</role>

<context>
- 창업 아이템: 시니어 맞춤형 저염 건강식단 새벽배송
- 창업자 경력: 25년 대기업 단체급식 총괄 및 영양사 자격 보유
- 타깃 고객: 혈당·혈압 조절이 필요한 6070 부모님 및 3040 직장인 자녀
</context>

<rules>
1. 대법원 등기소 및 키프리스 상표 검색 시 등록 가능성이 높은 고유명사로 제안할 것.
2. 순우리말 감성형, 직관형, 글로벌형, 신뢰형으로 다채롭게 5종을 도출할 것.
</rules>

<instructions>
[추천 법인명 5종 및 브랜드 슬로건]을 작성해 줘.
</instructions>

<output_format>
## 🏆 추천 법인명 및 브랜드 슬로건 Top 5
1. **[법인명]** (영문) - *슬로건* : 네이밍 의미 및 고객 가치
</output_format>`,
    preview: `## 🏆 추천 법인명 및 브랜드 슬로건 Top 5
1. **(주)효도한상** (HyodoHansang) - *"부모님의 건강한 하루, 새벽 식탁에 올립니다"*
   - 네이밍 의미: '자식의 효심이 담긴 정갈한 밥상'을 뜻하며 3040 자녀에게 즉각적인 공감 유발
2. **(주)케어테이블** (CareTable) - *"영양사가 설계하는 100세 맞춤 식단"*
   - 네이밍 의미: 전문적인 임상 영양 케어와 친근한 식탁의 결합
3. **(주)온새미로푸드** (Onsaemiro Food) - *"자연 그대로의 건강함을 매일 새벽에"*
   - 네이밍 의미: '언제나 변함없이 자연 그대로'라는 순우리말의 깊은 신뢰감`
  },

  "2_2": {
    badge: "2일차 산출물 2호",
    title: "정부지원사업 표준 1-Page 사업계획서 요약표",
    desc: "중소벤처기업부 예비창업패키지, 초기창업패키지 및 은행 대출 심사용 PSST 5대 항목 표준 마크다운 요약표를 완성합니다.",
    format: "1-Page 표준 마크다운 표 (PSST 프레임워크)",
    prompt: `<role>
너는 중소벤처기업부 및 창업진흥원의 "공인 창업 심사위원"이자 수석 컨설턴트야.
</role>

<context>
- 사업명: (주)효도한상 / 시니어 맞춤형 저염 건강도시락 새벽 정기배송
- 타깃 시장: 수도권 식단 관리가 필요한 6070 만성질환 가구 500곳
- 차별 솔루션: 영양사 1:1 상담, 당일 새벽 조리 당일 배송, 저염·저당 특허 조리
- 수익 모델: 월 35만 원(주 5일) 정기구독료 및 맞춤 건기식 큐레이션
</context>

<rules>
1. 공공기관 심사위원이 1분 안에 파악할 수 있도록 마크다운 표(Table)로 완벽히 구조화할 것.
2. 두루뭉술한 미사여구 대신 구체적 데이터와 개조식(-) 문장으로 작성할 것.
</rules>

<instructions>
[정부지원사업 표준] 1-Page 사업계획서 요약본 표를 작성해 줘.
</instructions>

<output_format>
## 📊 [정부지원사업 표준] 1-Page 사업계획서 요약본
| 항목 | 세부 핵심 전략 및 실행 방안 |
| :--- | :--- |
(7대 항목 표 구성)
</output_format>`,
    preview: `## 📊 [정부지원사업 표준] 1-Page 사업계획서 요약본
| 항목 | 세부 핵심 전략 및 실행 방안 |
| :--- | :--- |
| **1. 사업명** | (주)효도한상 - 액티브 시니어 맞춤 저염·영양 식단 새벽 정기배송 플랫폼 |
| **2. 문제 인식 (Problem)** | • 시니어 만성질환자 급증 대비 저염식 조리의 물리적 번거로움<br>• 맞벌이 자녀의 부모님 삼시세끼 영양 불균형 걱정 심화 |
| **3. 타깃 시장 (Market)** | • 1차 타깃: 서울/경기 거주 당뇨·고혈압 관리 필요 6070세대 1,000가구<br>• 시장 규모: 실버 케어 푸드 시장 연평균 14% 고성장 |
| **4. 해결 방안 (Solution)** | • 임상영양사 1:1 맞춤 식단 처방 알고리즘<br>• 당일 새벽 03시 조리 ➔ 07시 문앞 도착 원칙<br>• 특허받은 천연 감미료 기반 저염 조리법 |
| **5. 비즈니스 모델 (BM)** | • 월 정기구독료 (주 5일 배송: 월 35만 원 / 마진율 32%)<br>• 프리미엄 건강기능식품 큐레이션 번들 연계 매출 |
| **6. 마케팅 전략 (Growth)** | • 지역 보건소 및 노인종합복지관 무료 영양상담 부스 운영<br>• 네이버/카카오 '부모님 효도 선물' 키워드 퍼포먼스 마케팅 |
| **7. 팀 역량 (Team)** | • 대표자: 25년 단체급식 총괄 경력 및 영양사 면허 보유<br>• 산지 직거래 영농조합 20곳 원자재 공급 협약 완료 |`
  },

  "2_3": {
    badge: "2일차 산출물 3호",
    title: "경쟁사 SWOT 분석 매트릭스 & 전략 도출표",
    desc: "기존 대기업/스타트업 경쟁사 대비 우리 회사만의 강점(S), 약점(W), 기회(O), 위협(T) 및 4대 교차 전략(SO, ST, WO, WT)을 도출합니다.",
    format: "SWOT 4분면 매트릭스 표 + 4대 교차 실행 전략",
    prompt: `<role>
너는 글로벌 전략 컨설팅 펌의 "비즈니스 모델 및 경쟁전략 수석 파트너"야.
</role>

<context>
- 신규 진입 아이템: 시니어 맞춤 건강도시락 새벽배송
- 기존 경쟁사: 대기업 프레시지/CJ 밀키트, 일반 배민 배달 음식점
</context>

<rules>
1. 일반론적인 내용이 아닌, 대기업과 소상공인 사이에서 틈새를 뚫는 '스몰 자이언트' 전략으로 작성할 것.
2. SWOT 매트릭스 표와 4대 교차 전략(SO, ST, WO, WT)을 구체적으로 제시할 것.
</rules>

<instructions>
[경쟁사 SWOT 분석 매트릭스 및 4대 교차 실행 전략]을 작성해 줘.
</instructions>`,
    preview: `## 📊 SWOT 분석 매트릭스
| 구분 | 긍정적 요인 (Positive) | 부정적 요인 (Negative) |
| :--- | :--- | :--- |
| **내부 환경** | **강점 (Strengths)**<br>• 25년 현장 영양 설계 전문성<br>• 1:1 고객 맞춤 밀착 상담력 | **약점 (Weaknesses)**<br>• 초기 브랜드 인지도 부족<br>• 자체 콜드체인 물류망 부재 |
| **외부 환경** | **기회 (Opportunities)**<br>• 초고령 사회 진입 및 실버푸드 급성장<br>• 자녀 세대의 정기구독 결제 성향 | **위협 (Threats)**<br>• 대기업의 실버푸드 카테고리 확장<br>• 원자재 및 배송 인건비 상승 |

## 🎯 4대 교차 실행 전략
1. **SO 전략 (강점 x 기회)**: '영양사 1:1 전화 상담'을 무기로 자녀 세대에게 부모님 건강 리포트를 매월 발송하여 장기 구독 락인.
2. **ST 전략 (강점 x 위협)**: 대기업이 흉내 낼 수 없는 100% 수제 당일 조리 및 고객별 알레르기/질환 맞춤 식단으로 차별화.`
  },

  "2_4": {
    badge: "2일차 산출물 4호",
    title: "타깃 고객 심층 인터뷰(FGI) 시나리오",
    desc: "창업 전 아이템의 실패 위험을 줄이기 위해 실제 잠재 고객(시니어 및 자녀)에게 질문할 10가지 검증 질문지를 설계합니다.",
    format: "단계별 인터뷰 질문지 (아이스브레이킹 / 고충 탐색 / 가격 수용도 / 구매 전환)",
    prompt: `<role>
너는 린 스타트업(Lean Startup) 고객 개발(Customer Discovery) 전문가야.
</role>

<context>
- 검증 대상: 시니어 맞춤형 저염 건강도시락 구독 서비스
- 인터뷰 대상자: 1) 6070 부모님 세대, 2) 결제권자인 3040 자녀 세대
</context>

<rules>
1. "이 서비스 쓰실 건가요?" 같은 유도 질문을 배제하고, 과거의 실제 행동과 고충을 파악하는 질문을 설계할 것.
2. 부모님용 5문항, 자녀용 5문항으로 분리하여 작성할 것.
</rules>

<instructions>
[린 고객 인터뷰(FGI) 10대 핵심 질문 시나리오]를 작성해 줘.
</instructions>`,
    preview: `## 👥 1. 3040 직장인 자녀 대상 인터뷰 (결제권자 검증)
1. **현재 상황 탐색**: "부모님의 식사나 건강 관리와 관련해서 최근 가장 신경 쓰이셨던 순간은 언제인가요?"
2. **기존 대안의 한계**: "그 문제를 해결하기 위해 반찬 가게나 배달 음식을 이용해 보신 적이 있나요? 그때 어떤 점이 가장 아쉬우셨나요?"
3. **지불 용의 검증**: "부모님께 매일 영양사가 감수한 따뜻한 저염 식단과 건강 리포트가 제공된다면, 월 얼마 정도의 구독료가 적정하다고 생각하시나요?"

## 👴 2. 6070 부모님 대상 인터뷰 (실사용자 검증)
1. **식습관 페인포인트**: "병원에서 저염식이나 당뇨 식단을 권고받으셨을 때, 집에서 직접 챙겨 드실 때 어떤 점이 가장 힘드신가요?"
2. **배송 및 맛 선호도**: "새벽에 문 앞에 배송되는 건강 도시락을 받아보신다면 가장 중요하게 보실 요소(간, 식감, 국물 유무)는 무엇인가요?"`
  },

  "2_5": {
    badge: "2일차 산출물 5호",
    title: "초기 6개월 린(Lean) 실행 로드맵",
    desc: "법인 설립부터 MVP(최소 기능 제품) 제작, 초기 100명 유료 고객 확보까지 6개월간 주차별로 실행할 마일스톤 표를 도출합니다.",
    format: "월별/단계별 마일스톤 표 (기간 / 핵심 과업 / KPI / 필요 예산)",
    prompt: `<role>
너는 수많은 예비창업자를 흑자 전환시킨 "스타트업 엑셀러레이터(AC) 총괄 수석 심사역"이야.
</role>

<context>
- 창업 아이템: 시니어 맞춤 건강도시락 새벽 정기배송
- 목표: 창업 6개월 내 월 정기구독 고객 100명 달성 및 손익분기점(BEP) 돌파
</context>

<rules>
1. 뜬구름 잡는 계획 대신 매월 해야 할 구체적인 실무 과업(인허가, 위탁제조, 마케팅, 결제)을 명시할 것.
2. 1개월 단위 마일스톤 표(Table)로 작성할 것.
</rules>

<instructions>
[창업 초기 6개월 린 실행 로드맵 및 월별 핵심 과업표]를 작성해 줘.
</instructions>`,
    preview: `## 📅 초기 6개월 단계별 린 실행 로드맵
| 개월차 | 단계 (Phase) | 핵심 실행 과업 (Milestones) | 목표 KPI | 예상 예산 |
| :--- | :--- | :--- | :--- | :--- |
| **1개월차** | **기획 & 검증** | • 법인 상호 등기 및 사업자등록<br>• 잠재 고객 20명 인터뷰 및 메뉴 5종 레시피 확정 | 고객 인터뷰 20건 | 100만 원 |
| **2개월차** | **인허가 & 조리실** | • 즉석판매제조가공업 인허가 및 위생 교육<br>• 친환경 보냉 용기 및 패키징 샘플 테스트 | 조리 시설 승인 | 500만 원 |
| **3개월차** | **MVP 베타 런칭** | • 지인 및 지역 복지관 대상 20명 베타 테스터 운영<br>• 고객 피드백 기반 염도/식감 2차 개선 | 재주문율 60% | 200만 원 |
| **4개월차** | **공식 오픈 & 마케팅** | • 카카오 채널 및 스마트스토어 공식 구독 오픈<br>• 네이버 로컬 플레이스 및 당근마켓 광고 집행 | 유료 구독 40명 | 300만 원 |
| **5개월차** | **채널 확장** | • 지역 거점 병원/보건소 연계 영양 세미나 제휴<br>• 3040 자녀 타깃 인스타그램 효도 챌린지 | 유료 구독 70명 | 250만 원 |
| **6개월차** | **BEP 달성 & 안정화**| • 정기구독 100가구 돌파 (월 매출 3,500만 원 달성)<br>• 건기식 번들 큐레이션 신규 라인업 런칭 | 유료 구독 100명 (BEP 돌파) | 200만 원 |`
  }
};

// 모달 DOM 참조 및 이벤트 바인딩
const outputPromptModal = document.getElementById("outputPromptModal");
const outputModalBadge = document.getElementById("outputModalBadge");
const outputModalTitle = document.getElementById("outputModalTitle");
const outputModalDesc = document.getElementById("outputModalDesc");
const outputModalFormat = document.getElementById("outputModalFormat");
const outputModalPromptCode = document.getElementById("outputModalPromptCode");
const outputModalPreview = document.getElementById("outputModalPreview");
const btnCloseOutputModal = document.getElementById("btnCloseOutputModal");
const btnFooterCloseModal = document.getElementById("btnFooterCloseModal");
const btnCopyModalPrompt = document.getElementById("btnCopyModalPrompt");
const btnFooterCopyPrompt = document.getElementById("btnFooterCopyPrompt");

let currentModalPromptText = "";

function openOutputModal(outputId) {
  const data = OUTPUT_PROMPTS_DATA[outputId] || OUTPUT_PROMPTS_DATA[String(outputId)];
  if (!data || !outputPromptModal) return;

  outputModalBadge.textContent = data.badge;
  outputModalTitle.textContent = data.title;
  outputModalDesc.textContent = data.desc;
  outputModalFormat.textContent = data.format;
  outputModalPromptCode.textContent = data.prompt;
  outputModalPreview.innerHTML = data.preview.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  currentModalPromptText = data.prompt;

  outputPromptModal.classList.add("active");
  outputPromptModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // 배경 스크롤 방지
}

function closeOutputModal() {
  if (!outputPromptModal) return;
  outputPromptModal.classList.remove("active");
  outputPromptModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function initOutputModal() {
  const outputPills = document.querySelectorAll(".output-pill");
  outputPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const id = pill.getAttribute("data-output");
      if (id) {
        openOutputModal(id);
      }
    });
  });

  if (btnCloseOutputModal) btnCloseOutputModal.addEventListener("click", closeOutputModal);
  if (btnFooterCloseModal) btnFooterCloseModal.addEventListener("click", closeOutputModal);

  if (outputPromptModal) {
    outputPromptModal.addEventListener("click", (e) => {
      if (e.target === outputPromptModal) {
        closeOutputModal();
      }
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && outputPromptModal && outputPromptModal.classList.contains("active")) {
      closeOutputModal();
    }
  });

  if (btnCopyModalPrompt) btnCopyModalPrompt.addEventListener("click", copyModalPrompt);
  if (btnFooterCopyPrompt) btnFooterCopyPrompt.addEventListener("click", copyModalPrompt);
}

// 모달 내부 프롬프트 복사 함수
function copyModalPrompt() {
  if (!currentModalPromptText) return;
  copyToClipboard(currentModalPromptText, "📋 산출물 예시 프롬프트가 복사되었습니다! Claude에 붙여넣으세요.");
}

// ==========================================================================
// 8. 다크 & 앰버 골드 에디션 QR코드 모달 제어
// ==========================================================================
const goldQrModal = document.getElementById("goldQrModal");
const btnOpenGoldQr = document.getElementById("btnOpenGoldQr");
const btnCloseGoldQrModal = document.getElementById("btnCloseGoldQrModal");
const btnFooterCloseGoldQrModal = document.getElementById("btnFooterCloseGoldQrModal");

function openGoldQrModal() {
  if (!goldQrModal) return;
  goldQrModal.classList.add("active");
  goldQrModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeGoldQrModal() {
  if (!goldQrModal) return;
  goldQrModal.classList.remove("active");
  goldQrModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function initGoldQrModal() {
  if (btnOpenGoldQr) {
    btnOpenGoldQr.addEventListener("click", openGoldQrModal);
  }
  if (btnCloseGoldQrModal) {
    btnCloseGoldQrModal.addEventListener("click", closeGoldQrModal);
  }
  if (btnFooterCloseGoldQrModal) {
    btnFooterCloseGoldQrModal.addEventListener("click", closeGoldQrModal);
  }
  if (goldQrModal) {
    goldQrModal.addEventListener("click", (e) => {
      if (e.target === goldQrModal) {
        closeGoldQrModal();
      }
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && goldQrModal && goldQrModal.classList.contains("active")) {
      closeGoldQrModal();
    }
  });
}

// 초기화 실행
initOutputModal();
initGoldQrModal();


