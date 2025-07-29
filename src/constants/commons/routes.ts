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

  // Clinics
  CLINICS: '/clinics',
  CLINICS_DETAIL: (clinicId: number) => `/clinics/${clinicId}`,
  CLINICS_REVIEWS: (clinicId: number) => `/clinics/${clinicId}/reviews`,

  // Packages
  PACKAGES: '/packages',
  PACKAGES_DETAIL: (packageId: number) => `/packages/${packageId}`,

  // Reviews
  REVIEWS_FORM: (reservationId: number) => `/reviews/${reservationId}/form`,

  // Reservations
  RESERVATIONS: '/reservations',
  RESERVATIONS_DETAIL: (estimateId: number) => `/reservations/${estimateId}`,

  // Chat
  CHATS: '/chats',
  CHATS_DETAIL: (chatId: number) => `/chats/${chatId}`,

  //Payments
  PAYMENTS: '/payments',
  PAYMENTS_ORDER: '/payments/order',
  PAYMENTS_VALIDATE: '/payments/validate',
  PAYMENTS_COMPLETE: '/payments/complete',

  // Mypage
  MYPAGE: '/mypage',
  MYPAGE_USER_INFO: '/mypage/user-profile',
  MYPAGE_USER_INFO_EDIT: '/mypage/user-profile/edit',
  MYPAGE_REVIEWS: '/mypage/reviews',
  MYPAGE_FAVORITES: '/mypage/favorites',
  MYPAGE_PAYMENTS: '/mypage/payments',
} as const;
