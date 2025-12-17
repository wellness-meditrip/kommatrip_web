## 프로젝트 개요

- **목적**: B2C 글로벌 웰니스를 위한 한의학 플랫폼 (메디트립)
- **타입**: Next.js 기반 웹 프론트엔드 애플리케이션
- **구조**: 모놀리식 프론트엔드 아키텍처 (Pages Router)
- **주요 기능**:
  - 사용자 인증 (이메일, Google OAuth)
  - 업체/프로그램 검색 및 조회
  - 예약 관리
  - 리뷰 작성 및 조회
  - 마이페이지

## 기술 스택

- **Framework**: Next.js 15.4.4 (Pages Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.1.0
- **Styling**:
  - Emotion (@emotion/react, @emotion/styled)
  - CSS-in-JS 방식
- **State Management**:
  - React Query (@tanstack/react-query) - 서버 상태 관리
  - Zustand - 클라이언트 상태 관리
- **Authentication**: NextAuth.js 4.24.13
- **Form Management**: React Hook Form
- **HTTP Client**: Axios
- **Date Handling**: Day.js, @mui/x-date-pickers
- **Animation**: Framer Motion, Lottie React
- **Maps**: Google Maps JavaScript API
- **Storage**: AWS S3 (@aws-sdk/client-s3)
- **Code Quality**:
  - ESLint
  - Prettier
  - Stylelint
  - Husky (Git hooks)
  - lint-staged
  - Commitlint

## 코딩 스타일

- **언어**: TypeScript (strict mode)
- **컴포넌트**:
  - 함수형 컴포넌트 사용
  - React Hooks 활용
  - 컴포넌트는 PascalCase로 명명
- **파일 구조**:
  - 컴포넌트: `컴포넌트명/index.tsx`, `컴포넌트명/index.styles.ts`
  - 타입 정의: 각 도메인별 `models/` 폴더에 분리
  - 스타일: Emotion의 `css` prop 사용
- **네이밍 컨벤션**:
  - 변수/함수: camelCase
  - 컴포넌트: PascalCase
  - 상수: UPPER_SNAKE_CASE
  - 타입/인터페이스: PascalCase
- **스타일링**:
  - Emotion CSS-in-JS 사용
  - `css` prop으로 스타일 정의
  - 반응형 디자인: theme.breakpoints 활용
  - 스타일 파일은 `.styles.ts` 확장자 사용
- **API 통신**:
  - Axios 기반 HTTP 클라이언트
  - React Query로 서버 상태 관리
  - API 함수는 `apis/` 폴더에 도메인별 분리
  - 타입은 `models/` 폴더에 정의
- **에러 처리**:
  - 중앙화된 에러 핸들러 사용
  - Toast로 사용자에게 에러 알림
- **코드 품질**:
  - ESLint 규칙 준수
  - Prettier로 코드 포맷팅
  - Git commit 전 자동 린트/포맷팅 (lint-staged)
  - Conventional Commits 형식 사용

## 프로젝트 구조

```
meditrip-web/
├── public/                    # 정적 파일
│   ├── icons/                 # SVG 아이콘
│   ├── fonts/                 # 폰트 파일
│   └── json/                  # JSON 데이터
├── src/
│   ├── apis/                  # API 클라이언트
│   │   ├── auth/              # 인증 API
│   │   ├── company/           # 업체 API
│   │   ├── program/           # 프로그램 API
│   │   ├── reservation/       # 예약 API
│   │   ├── review/            # 리뷰 API
│   │   └── config/            # HTTP 클라이언트 설정
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── button/            # 버튼 컴포넌트
│   │   ├── input/             # 입력 컴포넌트
│   │   ├── company/           # 업체 관련 컴포넌트
│   │   ├── reservation/       # 예약 관련 컴포넌트
│   │   ├── review/            # 리뷰 관련 컴포넌트
│   │   └── ...                # 기타 공통 컴포넌트
│   ├── constants/             # 상수 정의
│   │   ├── commons/           # 공통 상수
│   │   └── error-codes/       # 에러 코드
│   ├── hooks/                 # 커스텀 훅
│   │   ├── auth/              # 인증 관련 훅
│   │   ├── reservation/       # 예약 관련 훅
│   │   └── review/            # 리뷰 관련 훅
│   ├── models/                # 타입 정의 (API 응답/요청)
│   │   ├── auth/              # 인증 타입
│   │   ├── company/           # 업체 타입
│   │   ├── program/           # 프로그램 타입
│   │   ├── reservation/       # 예약 타입
│   │   └── review/            # 리뷰 타입
│   ├── pages/                 # Next.js Pages Router
│   │   ├── api/               # API 라우트
│   │   │   └── auth/           # 인증 API 라우트
│   │   ├── login/             # 로그인 페이지
│   │   ├── signup/            # 회원가입 페이지
│   │   ├── company/           # 업체 페이지
│   │   ├── reservations/      # 예약 페이지
│   │   └── ...                # 기타 페이지
│   ├── providers/             # Context Provider
│   │   └── query-provider/    # React Query Provider
│   ├── queries/               # React Query 쿼리 정의
│   │   ├── auth/              # 인증 쿼리
│   │   ├── company/           # 업체 쿼리
│   │   └── ...                # 기타 쿼리
│   ├── server/                # 서버 사이드 로직
│   │   └── auth/              # NextAuth 설정
│   ├── styles/                # 전역 스타일
│   │   ├── theme.ts           # 테마 설정
│   │   ├── colors.ts          # 색상 정의
│   │   └── typography.ts      # 타이포그래피
│   ├── types/                 # 전역 타입 정의
│   │   └── next-auth.d.ts     # NextAuth 타입 확장
│   └── utils/                 # 유틸리티 함수
│       ├── error-handler.ts   # 에러 처리
│       └── validation.ts      # 유효성 검사
├── .cursor/                   # Cursor 설정
│   └── rules/                 # 프로젝트 규칙 문서
├── .cursorignore              # Cursor 무시 파일
├── eslint.config.mjs          # ESLint 설정
├── next.config.ts             # Next.js 설정
├── tsconfig.json              # TypeScript 설정
└── package.json               # 의존성 관리
```

## 아키텍처 설계 원칙

- **컴포넌트 기반**: 재사용 가능한 컴포넌트로 UI 구성
- **도메인 분리**: 기능별로 폴더 구조 분리 (apis, models, queries)
- **타입 안정성**: TypeScript strict mode로 타입 안정성 보장
- **서버 상태 관리**: React Query로 서버 상태 중앙 관리
- **스타일링**: Emotion으로 컴포넌트 스코프 스타일링
- **인증**: NextAuth.js로 OAuth 및 세션 관리

## 개발 접근 방식

- **설명형 개발**: 코드 작성 시 각 단계의 목적과 이유를 설명
- **강사형 접근**: 전문가이지만 옆에서 가르치는 듯한 친근한 톤
- **단계별 진행**: 복잡한 작업을 작은 단위로 나누어 설명과 함께 진행
- **이유 중심**: "왜 이렇게 하는지"에 대한 설명 포함
- **선택지 제안**: 여러 구현 방법이 있을 때 장단점과 함께 제안

## 주요 기능별 가이드

- **인증**: NextAuth.js를 통한 이메일/Google OAuth 로그인
- **API 통신**: Axios + React Query 패턴
- **스타일링**: Emotion의 `css` prop 활용
- **폼 관리**: React Hook Form으로 폼 상태 및 유효성 검사
- **에러 처리**: 중앙화된 에러 핸들러 + Toast 알림
