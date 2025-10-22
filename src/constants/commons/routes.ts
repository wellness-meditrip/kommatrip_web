export const ROUTES = {
  LOGIN: '/login',
  ONBOARDING: '/onboarding',
  ONBOARDING_USER_INFO: '/onboarding?step=user-info',
  ONBOARDING_SEARCH_ADDRESS: '/onboarding?step=search-address',
  TERMS_OF_USE: '/login/terms',

  HOME: '/',
  SEARCH: '/search',
  SEARCH_RESULT: (keyword: string) => `/search?keyword=${keyword}`,
  SEARCH_ADDRESS: '/search-address',

  // company
  COMPANY: '/company',
  COMPANY_DETAIL: (companyId: number) => `/company/${companyId}`,
  COMPANY_REVIEWS: (companyId: number) => `/company/${companyId}/reviews`,
  COMPANY_PROGRAM: (companyId: number) => `/company/${companyId}/program`,

  // Packages
  PACKAGES: '/packages',
  PACKAGES_DETAIL: (packageId: number) => `/packages/${packageId}`,

  // Mypage
  MYPAGE: '/mypage',
  MYPAGE_REVIEWS: '/mypage/reviews',
  MYPAGE_RESERVATIONS: '/mypage/reservations',
  MYPAGE_USER_INFO: '/mypage/user-profile',
  MYPAGE_USER_INFO_EDIT: '/mypage/user-profile/edit',
  MYPAGE_FAVORITES: '/mypage/favorites',
  MYPAGE_PAYMENTS: '/mypage/payments',

  // REVIEWS
  REVIEW: '/review',
  REVIEW_EDIT: '/review/edit',

  // RESERVATIONS
  RESERVATIONS: '/reservations',
  RESERVATIONS_COMPLETE: '/reservations/complete',
} as const;
