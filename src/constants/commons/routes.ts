export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  TERMS_OF_USE: '/login/terms',
  ONBOARDING: '/onboarding',
  ONBOARDING_USER_INFO: '/onboarding?step=user-info',
  ONBOARDING_SEARCH_ADDRESS: '/onboarding?step=search-address',

  HOME: '/',
  ARTICLES: '/articles',
  ARTICLE_DETAIL: (slug: string) => `/articles/${slug}`,
  SEARCH: '/search',
  SEARCH_RESULTS: '/search/results',
  // SEARCH_RESULT: (keyword: string) => `/search?keyword=${keyword}`,

  // company
  COMPANY: '/company',
  COMPANY_DETAIL: (companyId: number) => `/company/${companyId}`,
  COMPANY_REVIEWS: (companyId: number) => `/company/${companyId}/reviews`,
  COMPANY_PROGRAM_DETAIL: (companyId: number, programId: number) =>
    `/company/${companyId}/program/${programId}`,

  // Mypage
  MYPAGE: '/mypage',
  MYPAGE_REVIEWS: '/mypage/reviews',
  MYPAGE_RESERVATIONS: '/mypage/reservations',
  MYPAGE_USER_INFO: '/mypage/user-info',
  MYPAGE_USER_INFO_EDIT: '/mypage/user-info/edit',
  MYPAGE_SETTINGS: '/mypage/settings',
  MYPAGE_PAYMENTS: '/mypage/payments',

  // RESERVATIONS
  RESERVATIONS: '/reservations',
  RESERVATIONS_PAYMENT_SUCCESS: '/reservations/payment/success',
  RESERVATIONS_PAYMENT_FAIL: '/reservations/payment/fail',
  RESERVATIONS_PAYMENT_PENDING: '/reservations/payment/pending',
  BOOKINGS: '/bookings',
  BOOKINGS_DETAIL: (reservationId: number | string) => `/bookings/${reservationId}`,
  BOOKING_REVIEW_CREATE: (reservationId: number | string) => `/bookings/${reservationId}/review`,

  // REVIEWS
  REVIEW_EDIT: (reviewId: number | string) => `/mypage/reviews/${reviewId}`,

  // INTEREST
  INTEREST: '/interest',

  // ADMIN
  ADMIN_DASHBOARD: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_USERS: '/admin/users',
  ADMIN_COMPANIES: '/admin/companies',
  ADMIN_RESERVATIONS: '/admin/reservations',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_COMPANY_NEW: '/admin/companies/new',
  ADMIN_COMPANY_EDIT: (companyId: number | string) => `/admin/companies/${companyId}/edit`,
  ADMIN_COMPANY_PROGRAMS: (companyId: number | string) => `/admin/companies/${companyId}/programs`,
  ADMIN_COMPANY_REVIEWS: (companyId: number | string) => `/admin/companies/${companyId}/reviews`,
  ADMIN_COMPANY_PROGRAM_NEW: (companyId: number | string) =>
    `/admin/companies/${companyId}/programs/new`,
  ADMIN_COMPANY_PROGRAM_EDIT: (companyId: number | string, programId: number | string) =>
    `/admin/companies/${companyId}/programs/${programId}/edit`,
} as const;
