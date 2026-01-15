# 다국어(i18n) 사용 가이드

이 프로젝트는 `next-intl`을 사용하여 한국어(ko), 영어(en), 일본어(ja)를 지원합니다.

## 기본 구조

- **로케일**: `ko`, `en`, `ja`
- **기본 로케일**: `en`
- **메시지 파일**: `messages/{locale}/{namespace}.json`
- **URL 구조**: `/{locale}/...` (예: `/ko/company`, `/en/company`)

## 컴포넌트에서 사용하기

### 클라이언트 컴포넌트

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <button>{t('button.confirm')}</button>
    </div>
  );
}
```

### 네임스페이스 사용

```tsx
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations('mypage');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('points.title')}</p>
      <p>{t('points.balance')}</p>
    </div>
  );
}
```

## 네비게이션

### 로케일 유지하면서 링크

```tsx
import { Link } from '@/i18n/navigation';

export default function Navigation() {
  return (
    <nav>
      <Link href="/company">Company</Link>
      <Link href="/mypage">My Page</Link>
    </nav>
  );
}
```

### 로케일 변경

```tsx
import { useChangeLocale, useCurrentLocale } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();

  return (
    <div>
      <button onClick={() => changeLocale('ko')} disabled={currentLocale === 'ko'}>
        한국어
      </button>
      <button onClick={() => changeLocale('en')} disabled={currentLocale === 'en'}>
        English
      </button>
      <button onClick={() => changeLocale('ja')} disabled={currentLocale === 'ja'}>
        日本語
      </button>
    </div>
  );
}
```

## 메시지 파일 구조

메시지는 네임스페이스별로 관리됩니다:

```
messages/
  ├── ko/
  │   ├── common.json
  │   ├── header.json
  │   ├── mypage.json
  │   └── ...
  ├── en/
  │   └── ...
  └── ja/
      └── ...
```

### 메시지 파일 예제

`messages/ko/common.json`:

```json
{
  "app": {
    "title": "kommatrip - 글로벌 웰니스를 위한 한의학 플랫폼"
  },
  "button": {
    "confirm": "확인",
    "cancel": "취소"
  }
}
```

## Fallback 메커니즘

번역 키가 없을 경우 자동으로 fallback됩니다:

- **en**: ko → en
- **ko**: en → ko
- **ja**: ko → en → ja

## 로케일 감지 순서

1. URL 경로의 로케일 프리픽스
2. 쿠키 (`NEXT_LOCALE`)
3. 브라우저 `Accept-Language` 헤더
4. 기본값: `en`

## 주의사항

- 모든 페이지는 `/{locale}/...` 형식의 URL을 가집니다
- `/api`, `/admin` 등은 다국어 처리에서 제외됩니다
- 로케일이 없는 URL로 접근하면 자동으로 리다이렉트됩니다
