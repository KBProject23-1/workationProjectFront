# Workation Project Frontend

> KB IT's Your Life 7기 프로젝트 — 워케이션 관리 플랫폼 프론트엔드

## 프로젝트 개요

워케이션(Work + Vacation) 기반 프론트엔드 프로젝트입니다.  
사용자가 워케이션 일정을 등록하고, 숙소·공유오피스·음식점·여가 활동을 예약하며, 지출 내역을 관리하고 정산까지 처리할 수 있는 모바일 웹(PWA)입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| **프레임워크** | Vue 3 (Composition API, `<script setup>`) |
| **라우팅** | Vue Router 5 (HTML5 History 모드) |
| **상태 관리** | Pinia 3 |
| **HTTP 클라이언트** | Axios (쿠키 기반 인증, CSRF 토큰 관리, 401 자동 갱신) |
| **스타일링** | Tailwind CSS 4 + `tw-animate-css` |
| **UI 컴포넌트** | Reka UI + Shadcn Vue 컨벤션 (`class-variance-authority`, `clsx`, `tailwind-merge`) |
| **아이콘** | Lucide Vue |
| **알림** | vue-sonner (토스트) |
| **QR 코드** | qrcode |
| **빌드** | Vite 8 |
| **PWA** | vite-plugin-pwa (Service Worker, autoUpdate) |
| **폰트** | Pretendard Variable (동적 서브셋) |
| **Node.js** | v22.23.2 |

## 프로젝트 구조

```
workationProjectFront/
├── .github/
│   ├── ISSUE_TEMPLATE/          # 기능 요청 템플릿
│   └── PULL_REQUEST_TEMPLATE.md # PR 체크리스트 템플릿
├── front/
│   ├── public/                  # 정적 리소스 (favicon, icon, robots.txt)
│   ├── src/
│   │   ├── api/                 # Axios 기반 API 모듈 (22개)
│   │   │   ├── axiosInstance.js # 공통 인스턴스 (CSRF, 401 갱신, 응답 언래핑)
│   │   │   ├── auth.js          # 로그인/로그아웃/세션 관리
│   │   │   ├── csrf.js          # CSRF 토큰 관리
│   │   │   └── ...              # 도메인별 API 모듈
│   │   ├── assets/
│   │   │   ├── main.css         # 글로벌 스타일 + 디자인 토큰 (@theme)
│   │   │   ├── icons/           # 아이콘 에셋
│   │   │   └── images/
│   │   │       ├── merchants/   # 가맹점 기본 이미지 (숙소/공유오피스/음식점/여가)
│   │   │       ├── onboarding/  # 온보딩 이미지
│   │   │       └── regions/     # 지역 이미지
│   │   ├── components/
│   │   │   ├── common/          # 공통 컴포넌트 (BaseButton, BaseHeader, LoadingScreen 등)
│   │   │   ├── ui/              # Shadcn Vue 스타일 UI (button, dialog, input, select, sonner)
│   │   │   ├── account/         # 계정 관련 컴포넌트
│   │   │   ├── bookmark/        # 북마크 컴포넌트
│   │   │   ├── card/            # 카드 컴포넌트
│   │   │   ├── identity/        # 본인인증 컴포넌트
│   │   │   ├── layout/          # 레이아웃 컴포넌트
│   │   │   ├── merchant/        # 가맹점 관련 컴포넌트
│   │   │   ├── pin/             # PIN 입력 컴포넌트
│   │   │   ├── recommendation/  # 추천 컴포넌트
│   │   │   ├── reservation/     # 예약 컴포넌트
│   │   │   ├── review/          # 리뷰 컴포넌트
│   │   │   ├── schedule/        # 일정 컴포넌트
│   │   │   ├── survey/          # 설문 컴포넌트
│   │   │   ├── transaction/     # 거래 내역 컴포넌트
│   │   │   ├── wallet/          # 지갑 컴포넌트
│   │   │   └── workation/       # 워케이션 컴포넌트
│   │   ├── composables/         # Vue Composition 함수 (9개)
│   │   ├── config/              # 상수/설정 (추천 카테고리, 예약 필터, 가맹점 기본 이미지 등)
│   │   ├── identity/            # 본인인증 Provider (Mock 구현, 추후 PortOne V2 연동 예정)
│   │   ├── lib/                 # 유틸리티 (cn 함수)
│   │   ├── pages/               # 페이지 컴포넌트 (아래 상세)
│   │   ├── router/              # 라우터 (모듈별 분리, 네비게이션 가드)
│   │   ├── stores/              # Pinia 스토어 (17개 + merchant 서브 스토어 5개)
│   │   └── utils/               # 유틸리티 함수 (카드 포맷, 날짜, 디바이스, UUID 등)
│   ├── .env                     # 환경 변수
│   ├── vite.config.js           # Vite 설정 (PWA, 프록시, aliases)
│   ├── eslint.config.js         # ESLint 설정
│   └── .prettierrc.cjs          # Prettier 설정
```

## 주요 기능

### 인증 및 회원 관리
- PASS 본인인증 기반 회원가입 (중복가입 방지)
- 쿠키 기반 JWT 인증 (HttpOnly accessToken/refreshToken)
- 로그인/로그아웃/세션 복원 (페이지 새로고침 대응)
- 아이디 찾기 / 비밀번호 재설정 (이메일 인증)
- PIN 번호 설정 및 관리 (기기별)
- 계정 설정 (이메일 변경, 휴대폰 번호 변경, 비밀번호 변경, 회원 탈퇴)
- 프로필 수정

### 온보딩 플로우
- 스플래시 → 온보딩 → 로그인/회원가입 → 계좌 연결 → 카드 연결 → PIN 설정
- 라우터 가드로 단계별 진입 제어

### 워케이션 관리
- 워케이션 일정 등록 (날짜/시간 선택, 설문 기반)
- 워케이션 홈 (진행 중/예정/완료 상태별 표시)
- 일정 상세 보기 및 수정/삭제
- D-day 카운트다운
- 설문 이력이 있으면 2단계 등록 (기존 설문 재사용 안내)

### 워케이션 스타일 설문
- 워케이션 스타일 설문조사 (추천 알고리즘 기반)
- 설문 결과 조회 및 수정
- 내 정보에서 워케이션 스타일 확인

### 예산 관리
- 워케이션 예산 배정 (총예산 수정 가능)
- 세부 예산 금액 설정
- 법인카드 보유 여부에 따른 예산 유형 표기
- 지출 내역에 예산 사용 현황 표시

### 예약 시스템
- 예약 목록 조회 (유형별 필터: 숙소/공유오피스/음식점/여가)
- 예약 생성 및 완료 화면
- 예약 상세 보기 (썸네일, 가맹점명 클릭 시 상세 페이지 이동)
- 예약 취소 (경고 → 취소완료/취소실패)
- 예약 상세 뒤로가기 경로 관리

### 추천 시스템
- 카테고리별 추천 (숙소, 공유오피스, 음식점, 여가)
- 추천 받기 / 내 조건으로 찾기 모드
- 식별 기반 추천 (숙소↔공유오피스 기준점 연동)
- 식사별 기준점 자동 설정 (아침-숙소, 점심-공유오피스, 저녁-중간지점)
- 정렬 (평점 높은순, 가격 낮은순/높은순)
- 무한 스크롤

### 가맹점 상세
- 숙소 상세 (AccommodationDetail)
- 공유오피스 상세 (OfficeDetail)
- 음식점 상세 (RestaurantDetail)
- 여가 활동 상세 (ActivityDetail)
- 가맹점 기본 이미지 (카테고리별 분산 매핑)
- 상세정보 더보기

### 리뷰
- 리뷰 목록 (내 리뷰, 가맹점별 리뷰)
- 리뷰 작성/수정/삭제 (이용내역 기반 CUD)
- 리뷰 상세 보기
- 리뷰 카드 UI 및 무한 스크롤

### 북마크
- 북마크한 장소 목록
- 카테고리별 북마크 연동
- 상세 화면에서 북마크 수정

### 지출 및 정산
- 지출 내역 목록 (필터, 페이지네이션)
- 지출 상세 보기
- 지출 등록/수정
- 정산 회사 청구 안내 (식비 포함)
- 정산 완료 화면
- 정산 기록 목록
- Excel/PDF 다운로드 (Blob 응답 처리)

### 지갑
- 지갑 홈 (잔액 표시)
- 충전 (계좌 선택)
- 환불 (계좌 선택)
- PIN 결제 연동
- 거래 내역 목록/상세

### 카드
- 카드 연결
- 카드 닉네임 편집
- 삭제 카드 조회

### 계좌
- 계좌 연결

### 알림
- 알림 목록 페이지
- 알림 수신 설정
- 모든 읽음 처리

### 내 정보
- 마이 페이지 (사용자 정보 연동)
- 프로필 수정
- 예약 내역 진입점
- 워케이션 정산기록 진입점
- 워케이션 스타일 조회/수정

## 네비게이션 구조

라우터는 모듈별로 분리되어 `router/index.js`에서 통합 관리합니다.

| 라우터 파일 | 담당 영역 |
|-------------|-----------|
| `splashRouter.js` | 스플래시 화면 |
| `loginRouter.js` | 로그인, 아이디 찾기, 비밀번호 재설정 |
| `pinRouter.js` | PIN 설정 |
| `onboardingRouter.js` | 온보딩 |
| `accountRouter.js` | 계정 설정, 내 정보, 프로필 |
| `cardRouter.js` | 카드 연결/편집 |
| `walletRouter.js` | 지갑 (충전/환불/거래내역) |
| `transactionRouter.js` | 거래 내역 |
| `workationRouter.js` | 워케이션 (홈/등록/일정/지출/정산) |
| `surveyRouter.js` | 설문조사 |
| `merchantRouter.js` | 가맹점 상세 |
| `reservationRouter.js` | 예약 (목록/생성/상세/취소) |
| `recommendationRouter.js` | 추천 |
| `bookmarkRouter.js` | 북마크 |
| `reviewRouter.js` | 리뷰 |
| `notificationRouter.js` | 알림 |

### 네비게이션 가드

- **비로그인**: 공개 경로(스플래시/온보딩/로그인/아이디 찾기/비밀번호 재설정)만 허용
- **로그인 상태**: 공개 경로 접근 시 `/workation`으로 리다이렉트
- **PIN 미등록**: PIN 설정 페이지(`/pin/setup`)로 리다이렉트 (온보딩 링크는 예외)
- **세션 복원**: 첫 네비게이션에서 `GET /users/me`로 세션 복원 시도

## 상태 관리 (Pinia Store)

| 스토어 | 담당 |
|--------|------|
| `authStore` | 인증 상태, 세션 복원 |
| `workationStore` | 워케이션 CRUD |
| `scheduleStore` | 일정 관리 |
| `budgetStore` | 예산 관리 |
| `expenseStore` | 지출 내역 |
| `settlementStore` | 정산 관리 |
| `reservationStore` | 예약 관리 |
| `recommendationStore` | 추천 시스템 |
| `surveyStore` | 설문조사 |
| `reviewStore` | 리뷰 관리 |
| `bookmarkStore` | 북마크 |
| `notificationStore` | 알림 |
| `walletStore` | 지갑/충전/환불 |
| `transactionStore` | 거래 내역 |
| `cardStore` | 카드 관리 |
| `categoryStore` | 카테고리 |
| `accountStore` | 계좌 관리 |
| `merchant/*Store` | 가맹점 도메인별 (숙소/공유오피스/음식점/여가/예약가맹점) |

## API 통신

### 공통 설정 (`axiosInstance.js`)
- **Base URL**: `VITE_API_BASE_URL/api/v1`
- **인증**: 쿠키 기반 JWT (HttpOnly, `withCredentials: true`)
- **CSRF 방어**: 상태 변경 요청(POST/PUT/PATCH/DELETE)에 `X-XSRF-TOKEN` 헤더 자동 추가
- **401 갱신**: accessToken 만료 시 refreshToken으로 자동 재발급 (큐 처리로 동시 갱신 방지)
- **403 재시도**: CSRF 토큰 갱신으로 인한 403 시 1회 재시도
- **응답 언래핑**: `{ status, message, data }` → `data` 자동 추출
- **에러 메시지**: Blob 응답도 JSON 파싱하여 메시지 추출

### API 모듈 목록

`account`, `auth`, `bookmark`, `budget`, `card`, `category`, `expense`, `identityVerification`, `merchants`, `notification`, `recommendation`, `reservations`, `review`, `schedule`, `settlement`, `survey`, `transaction`, `user`, `wallet`, `workation`

## 디자인 시스템

### 디자인 토큰 (`main.css`)

**브랜드 컬러**
- `--color-brand`: #3087ed (기본 브랜드)
- `--color-brand-strong`: #1b5fc4
- `--color-brand-weak`: #eef5fe
- `--color-navy`: #0b3155

**텍스트**
- `--text-caption`: 11px / `--text-body-sm`: 13px / `--text-body`: 15px
- `--text-title`: 17px / `--text-heading`: 20px / `--text-display`: 28px

**모서리**
- `--radius-card`: 16px / `--radius-sheet`: 22px / `--radius-chip`: 10px

**그림자**
- `--shadow-card`: 카드용 / `--shadow-float`: 떠 있는 요소용 / `--shadow-cta`: 버튼용

**폰트**: Pretendard Variable (동적 서브셋 로딩)

### 공통 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `BaseButton.vue` | 공용 버튼 |
| `BaseHeader.vue` | 공용 헤더 (뒤로가기 아이콘 통일) |
| `BaseInput.vue` | 공용 입력 필드 |
| `BaseSelectItem.vue` | 공용 선택 항목 |
| `BaseConfirmModal.vue` | 확인용 모달 |
| `BaseEmptyState.vue` | 빈 상태 표시 |
| `BaseErrorState.vue` | 에러 상태 표시 |
| `LoadingScreen.vue` | 로딩 화면 |

## 개발 환경 설정

### 사전 요구사항

- Node.js v22.23.2
- npm (또는 pnpm/yarn)

### 설치 및 실행

```bash
cd front
npm install
npm run dev        # 개발 서버 (http://localhost:5173)
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm run lint       # ESLint 검사
npm run format     # Prettier 포맷팅
```

### 환경 변수

`front/.env` 파일에 아래를 설정합니다:

```
VITE_API_BASE_URL=http://localhost:8080
```

### Vite 프록시

개발 환경에서 `/api` 요청은 `http://localhost:8080`으로 프록시됩니다.

## 브랜치 전략

- `main`: 프로덕션 배포용
- `dev/front`: 개발 통합 브랜치
- `feat/*`, `feature/*`: 기능 개발 브랜치 (이슈 번호 포함)
- `fix/*`: 버그 수정 브랜치
- `refactor/*`: 리팩토링 브랜치
- `style/*`: 스타일/UI 수정 브랜치
- `hotfix/*`: 긴급 수정 브랜치

### 커밋 컨벤션

```
[#이슈번호] 타입: 설명
```

**타입**: `feat`, `fix`, `refactor`, `style`, `chore`, `hotfix`, `perf`


## 주요 이슈 및 PR

- [#182] UI 전반 수정
- [#185] 워케이션 예약 기간 선택 UX 개선
- [#187] 리뷰·북마크 카드 UI와 무한 스크롤 개선
- [#180] 예약 페이지 화면 수정 및 뒤로가기 재정렬
- [#176] 알림 목록/수신 설정 페이지 구현
- [#174] 가맹점 기본 이미지 처리 공통화, 예약 완료 애니메이션
- [#167] 디자인 토큰 도입 및 전 화면 디자인 통일
- [#157] 지역 상세 가이드 및 인기 장소 정렬
- [#154] 헤더/버튼/뒤로가기 컴포넌트 통일
- [#14 static6] 워케이션 등록·일정 상세 화면 디자인 토큰 적용
- [#144] 워케이션 정산기록 목록 화면
- [#142] 예약 요약 문구 개선 및 에러 코드 처리
- [#135] 계정 설정 (이메일/휴대폰 변경, 회원 탈퇴)
- [#117] 음식점/여가활동 상세에서 일정 등록
- [#93] 홈 추천 탭 및 워케이션 등록 플로우 개선
- [#88] PIN 번호 시스템 (충전/환불 연동)
- [#84] 로그인 API 연동 및 인증 상태 관리
- [#68] PASS 인증 기반 회원가입
- [#34] 스플래시 화면 및 초기 라우팅
