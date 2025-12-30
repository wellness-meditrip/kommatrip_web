export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  TERMS_OF_USE: '/login/terms',
  ONBOARDING: '/onboarding',
  ONBOARDING_USER_INFO: '/onboarding?step=user-info',
  ONBOARDING_SEARCH_ADDRESS: '/onboarding?step=search-address',

  HOME: '/',
  SEARCH: '/search',
  SEARCH_RESULTS: '/search/results',
  // SEARCH_RESULT: (keyword: string) => `/search?keyword=${keyword}`,

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
  MYPAGE_USER_INFO: '/mypage/user-info',
  MYPAGE_USER_INFO_EDIT: '/mypage/user-info/edit',
  MYPAGE_SETTINGS: '/mypage/settings',
  MYPAGE_PAYMENTS: '/mypage/payments',

  // REVIEWS
  REVIEW: '/review',
  REVIEW_EDIT: '/review/edit',

  // RESERVATIONS
  RESERVATIONS: '/reservations',
  RESERVATIONS_PAYMENT: '/reservations/payment',
  RESERVATIONS_COMPLETE: '/reservations/complete',
  BOOKINGS: '/bookings',
  BOOKINGS_DETAIL: (reservationId: number | string) => `/bookings/${reservationId}`,

  // INTEREST
  INTEREST: '/interest',
} as const;
