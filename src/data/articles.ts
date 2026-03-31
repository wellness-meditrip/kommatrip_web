import type { Locale } from '@/i18n';
import type { ArticleDetail, ArticleListItem, ArticleRecord } from '@/models/article';

const ARTICLE_RECORDS: readonly ArticleRecord[] = [
  {
    slug: 'planning-your-first-wellness-trip',
    publishedAt: '2026-03-10',
    readingMinutes: 5,
    coverImage: '/images/hero/hero1.webp',
    translations: {
      en: {
        category: 'Guide',
        title: 'Planning Your First Wellness Trip to Korea',
        excerpt:
          'A practical checklist for narrowing down locations, comparing programs, and avoiding timing mistakes before you book.',
        seoDescription:
          'Learn how to shortlist companies, compare programs, and plan a first wellness trip to Korea with less guesswork.',
        sections: [
          {
            heading: 'Start with the outcome, not the brand',
            paragraphs: [
              'The fastest way to make a useful shortlist is to define the result you want first. Recovery, relaxation, skin care, or a quiet reset all lead to different filters.',
              'When the goal is clear, it becomes easier to compare companies by program fit, travel time, and booking windows instead of only by name recognition.',
            ],
          },
          {
            heading: 'Compare the operating details early',
            paragraphs: [
              'Before saving options, check business days, language support, refund rules, and available contact channels. These details usually create the biggest booking delays later.',
              'If your schedule is tight, build around realistic transit time and buffer for consultation, arrival, and post-care recovery.',
            ],
            bullets: [
              'Match the program duration to your actual free time',
              'Check whether weekday and weekend hours differ',
              'Prepare one backup option in case your first slot is unavailable',
            ],
          },
          {
            heading: 'Keep the booking request simple',
            paragraphs: [
              'A clear request converts faster than a long one. Share preferred dates, contact method, language preference, and one short note about what matters most to you.',
              'This reduces back-and-forth and makes it easier to confirm the reservation without changing the plan multiple times.',
            ],
          },
        ],
      },
      ko: {
        category: '가이드',
        title: '첫 웰니스 여행을 준비할 때 먼저 정리할 것',
        excerpt:
          '지역, 프로그램, 일정 조건을 빠르게 좁혀서 처음 예약할 때 실수하기 쉬운 포인트를 줄이는 체크리스트입니다.',
        seoDescription:
          '업체 비교, 프로그램 선택, 일정 검토까지 첫 웰니스 여행 예약 전에 먼저 정리해야 할 항목을 안내합니다.',
        sections: [
          {
            heading: '브랜드보다 목적부터 정리하세요',
            paragraphs: [
              '처음 후보를 고를 때는 유명한 곳부터 찾기보다 이번 여행에서 얻고 싶은 결과를 먼저 정하는 편이 훨씬 빠릅니다. 휴식, 회복, 피부 관리, 조용한 리셋은 필요한 프로그램이 다릅니다.',
              '목적이 분명하면 업체 이름보다 프로그램 적합도, 이동 동선, 예약 가능 일정 같은 실제 조건으로 비교할 수 있습니다.',
            ],
          },
          {
            heading: '운영 조건은 초반에 확인하는 편이 좋습니다',
            paragraphs: [
              '후보를 저장하기 전에 운영일, 응대 가능 언어, 환불 규정, 연락 채널부터 확인해두면 뒤에서 일정이 꼬일 가능성이 크게 줄어듭니다.',
              '일정이 빡빡하다면 시술 시간만 보지 말고 이동, 도착, 상담, 회복 시간까지 포함해서 여유를 잡는 편이 안전합니다.',
            ],
            bullets: [
              '프로그램 소요 시간을 실제 비는 시간과 맞출 것',
              '평일과 주말 운영 시간이 다른지 확인할 것',
              '1순위가 안 될 때를 대비해 대체 옵션 하나를 같이 둘 것',
            ],
          },
          {
            heading: '예약 문의는 짧고 선명하게',
            paragraphs: [
              '문의 내용이 길수록 응답 속도가 빨라지는 것은 아닙니다. 희망 날짜, 연락 방식, 언어, 가장 중요한 요청 한 줄이면 충분한 경우가 많습니다.',
              '핵심 정보만 정리해 전달하면 불필요한 왕복 없이 예약 확정까지 더 빠르게 갈 수 있습니다.',
            ],
          },
        ],
      },
    },
  },
  {
    slug: 'what-to-check-before-booking-a-program',
    publishedAt: '2026-03-18',
    readingMinutes: 4,
    coverImage: '/images/hero/hero4.webp',
    translations: {
      en: {
        category: 'Checklist',
        title: 'What to Check Before Booking a Program',
        excerpt:
          'A short pre-booking review for price, contact details, schedule fit, and refund rules so the reservation holds up after payment.',
        seoDescription:
          'Review the most important pre-booking checks for price, schedule fit, contact details, and refund rules before payment.',
        sections: [
          {
            heading: 'Confirm the exact scope of the program',
            paragraphs: [
              'Program names can look similar while included steps and duration differ. Read the description carefully and check whether consultation, add-ons, or aftercare are included.',
              'This is especially important when you compare offers across multiple companies or when the visit is part of a short trip.',
            ],
          },
          {
            heading: 'Make sure the contact path is usable during travel',
            paragraphs: [
              'A reservation is only as stable as the channel you can actually answer on time. Choose the contact method you can monitor during flights, hotel check-in, and local transit.',
            ],
            bullets: [
              'Verify at least one reachable phone or messenger account',
              'Keep timezone differences in mind for confirmation windows',
              'Double-check the preferred language setting before sending the request',
            ],
          },
          {
            heading: 'Read the refund and change conditions once',
            paragraphs: [
              'You do not need to memorize the policy, but you should know the change deadline and the main cancellation condition before paying.',
              'That one-minute check protects you if your travel schedule moves after payment.',
            ],
          },
        ],
      },
      ko: {
        category: '체크리스트',
        title: '프로그램 예약 전에 꼭 확인할 항목',
        excerpt:
          '가격, 연락처, 일정 적합성, 환불 규정처럼 결제 후에도 예약이 흔들리지 않게 만드는 핵심 확인 사항만 짧게 정리했습니다.',
        seoDescription:
          '프로그램 예약과 결제 전에 가격, 일정, 연락 채널, 환불 규정을 어떻게 확인해야 하는지 정리한 안내입니다.',
        sections: [
          {
            heading: '프로그램 범위를 정확히 보세요',
            paragraphs: [
              '프로그램 이름이 비슷해 보여도 실제 포함 단계와 소요 시간이 다를 수 있습니다. 설명에서 상담 포함 여부, 추가 옵션, 사후 관리 범위를 꼭 확인하는 편이 좋습니다.',
              '특히 여러 업체를 비교하거나 짧은 일정 안에 방문해야 할 때는 이 차이가 바로 예약 만족도에 영향을 줍니다.',
            ],
          },
          {
            heading: '여행 중에도 답할 수 있는 연락 채널인지 확인하세요',
            paragraphs: [
              '예약은 결국 연락이 이어져야 확정됩니다. 항공 이동, 호텔 체크인, 현지 이동 중에도 확인 가능한 채널을 우선으로 잡는 편이 안전합니다.',
            ],
            bullets: [
              '실제로 확인 가능한 전화나 메신저 계정을 최소 1개 둘 것',
              '확정 연락이 오는 시간대 차이를 고려할 것',
              '문의 전 선호 언어 설정을 다시 확인할 것',
            ],
          },
          {
            heading: '환불과 일정 변경 조건은 한 번만 읽어도 충분합니다',
            paragraphs: [
              '정책을 다 외울 필요는 없지만, 언제까지 변경 가능한지와 취소 기준 정도는 결제 전에 알고 가는 편이 좋습니다.',
              '이 한 번의 확인이 결제 후 일정이 바뀌었을 때 대응 여지를 만들어 줍니다.',
            ],
          },
        ],
      },
    },
  },
  {
    slug: 'from-inquiry-to-arrival',
    publishedAt: '2026-03-24',
    readingMinutes: 6,
    coverImage: '/images/hero/hero6.webp',
    translations: {
      en: {
        category: 'Process',
        title: 'From Inquiry to Arrival: A Simple Reservation Timeline',
        excerpt:
          'See the usual flow from the first request to confirmed arrival so you know what should happen before, during, and after payment.',
        seoDescription:
          'Understand the usual reservation flow from inquiry to arrival, including confirmation timing and what to prepare after payment.',
        sections: [
          {
            heading: 'Inquiry stage',
            paragraphs: [
              'At the start, the useful goal is not a long conversation but a clean request. Provide date options, contact preference, and any must-have condition.',
              'If the provider needs clarification, the reply cycle stays short when the first message is structured.',
            ],
          },
          {
            heading: 'Confirmation and payment',
            paragraphs: [
              'Once the slot is available, the next step is usually a payment request or a reservation confirmation flow. This is the point where price, timing, and key conditions should already be aligned.',
              'After payment, keep the confirmation details somewhere easy to reach so you can reference them quickly on the day of the visit.',
            ],
          },
          {
            heading: 'Arrival day',
            paragraphs: [
              'Try to arrive with enough buffer for check-in or consultation. A rushed arrival increases the chance of missing instructions or losing part of the reserved slot.',
              'Bring the confirmation details, stay reachable on the chosen contact channel, and keep any last-minute questions short and specific.',
            ],
            bullets: [
              'Save the address and local route in advance',
              'Keep your reservation date, time, and program name handy',
              'Arrive early enough for consultation or intake forms',
            ],
          },
        ],
      },
      ko: {
        category: '프로세스',
        title: '문의부터 방문까지 예약 흐름 한 번에 보기',
        excerpt:
          '첫 문의, 예약 확인, 결제, 방문 당일까지 보통 어떤 순서로 진행되는지 짧은 타임라인으로 정리했습니다.',
        seoDescription:
          '문의부터 결제, 방문 당일까지 예약 과정이 어떻게 이어지는지 이해하기 쉽게 정리한 아티클입니다.',
        sections: [
          {
            heading: '문의 단계',
            paragraphs: [
              '초기 문의에서 중요한 것은 긴 설명보다 구조가 잡힌 요청입니다. 가능한 날짜, 연락 방식, 꼭 필요한 조건을 먼저 전달하면 응답이 훨씬 빨라집니다.',
              '처음 메시지가 정리되어 있으면 추가 확인이 필요하더라도 왕복이 짧게 끝나는 경우가 많습니다.',
            ],
          },
          {
            heading: '확정과 결제 단계',
            paragraphs: [
              '예약 가능 시간이 확인되면 결제 요청이나 예약 확정 단계로 넘어갑니다. 이 시점에는 가격, 시간, 주요 조건이 이미 맞춰져 있어야 뒤에서 수정이 적습니다.',
              '결제 후에는 확인 정보를 따로 정리해 두는 편이 좋습니다. 방문 당일 빠르게 확인할 수 있어야 실제 이동이 편합니다.',
            ],
          },
          {
            heading: '방문 당일',
            paragraphs: [
              '체크인이나 상담을 고려해서 너무 촉박하지 않게 도착하는 편이 좋습니다. 급하게 도착하면 안내를 놓치거나 예약 시간을 충분히 활용하지 못할 수 있습니다.',
              '예약 정보는 바로 꺼낼 수 있게 준비하고, 선택한 연락 채널로는 당일에도 확인 가능하게 유지하는 편이 좋습니다.',
            ],
            bullets: [
              '주소와 현지 이동 경로를 미리 저장할 것',
              '예약 일시와 프로그램명을 바로 확인할 수 있게 둘 것',
              '상담이나 접수 시간을 고려해 조금 일찍 도착할 것',
            ],
          },
        ],
      },
    },
  },
] as const;

const sortByPublishedAt = (left: ArticleRecord, right: ArticleRecord) =>
  new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();

const toArticleListItem = (article: ArticleRecord, locale: Locale): ArticleListItem => {
  const translation = article.translations[locale];

  return {
    slug: article.slug,
    publishedAt: article.publishedAt,
    readingMinutes: article.readingMinutes,
    coverImage: article.coverImage,
    category: translation.category,
    title: translation.title,
    excerpt: translation.excerpt,
  };
};

export const getLocalizedArticles = (locale: Locale): ArticleListItem[] => {
  return [...ARTICLE_RECORDS]
    .sort(sortByPublishedAt)
    .map((article) => toArticleListItem(article, locale));
};

export const getLocalizedArticleBySlug = (slug: string, locale: Locale): ArticleDetail | null => {
  const article = ARTICLE_RECORDS.find((item) => item.slug === slug);

  if (!article) {
    return null;
  }

  const translation = article.translations[locale];

  return {
    slug: article.slug,
    publishedAt: article.publishedAt,
    readingMinutes: article.readingMinutes,
    coverImage: article.coverImage,
    category: translation.category,
    title: translation.title,
    excerpt: translation.excerpt,
    seoDescription: translation.seoDescription,
    sections: translation.sections,
  };
};

export const getAllArticleSlugs = () => ARTICLE_RECORDS.map((article) => article.slug);

export const getArticleSitemapPaths = () => [
  '/articles',
  ...getAllArticleSlugs().map((slug) => `/articles/${slug}`),
];
