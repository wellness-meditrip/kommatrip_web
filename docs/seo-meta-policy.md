# SEO 메타 정책

## 목표

- 타이틀/설명을 예측 가능하게 유지한다.
- 메타 조합 로직은 `createPageMeta`로 중앙화한다.
- 비공개/인증 페이지는 인덱싱되지 않게 한다.

## 환경 변수

- `NEXT_PUBLIC_SITE_URL`: canonical/OG/Twitter 절대 URL 생성에 사용
- `NEXT_PUBLIC_SITE_NAME`: OG `site_name`에 사용(선택)

## 타이틀 규칙

- 기본 형식: `"{pageTitle} | {appName}"`
- 검색/목록 키워드 포함: `"{keyword} - {pageTitle} | {appName}"`
- 홈은 `pageTitle`을 이미 `"{appName} | {appTitle}"` 형태로 만들어 전달한다
- `buildTitle`은 `pageTitle`에 앱명이 포함돼 있으면 중복으로 붙이지 않는다

## 설명 규칙

- 상세 페이지는 데이터 기반 설명을 우선 사용
- 그 외는 `common.app.description`로 폴백
- 권장 길이: 70~160자

## OG 이미지 규칙

- 기본: `/og/OG_image.jpg`
- 상세 페이지: 첫 이미지 사용, 없으면 기본 이미지
- 권장: 1200x630, 2MB 이하, JPG/PNG

## Canonical 규칙

- `router.asPath.split('?')[0]`로 경로를 만든다
- `createPageMeta`에서 `NEXT_PUBLIC_SITE_URL`이 있으면 절대 URL로 변환

## Noindex 정책

아래 경로는 `noindex` 적용:

- `/login`
- `/mypage` 및 `/mypage/*`
- `/reservations/*`
- `/admin/*` (추가 시)

## 사이트맵 정책

- 정적 라우트는 `src/pages/sitemap.xml.ts`에 등록
- 상세(업체/프로그램) 동적 라우트는 API 준비 후 추가

## JSON-LD 추천 대상

- 업체 상세: `Organization` 또는 `LocalBusiness` + `Review`(리뷰 있을 때)
- 프로그램 상세: `Product` 또는 `Service`
- 리뷰 페이지: `Review` + `author`/`itemReviewed`/`reviewRating`
