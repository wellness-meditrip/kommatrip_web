import {
  GnbHomeActive,
  GnbHomeInactive,
  GnbCalendarActive,
  GnbCalendarInactive,
  GnbMypageActive,
  GnbMypageInactive,
  GnbSearchActive,
  GnbSearchInactive,
} from '@/icons';
import { ROUTES } from './routes';

export const MENUS = [
  {
    labelKey: 'navigation.home',
    icon: {
      active: <GnbHomeActive width="32px" height="32px" />,
      inactive: <GnbHomeInactive width="32px" height="32px" />,
    },
    path: ROUTES.HOME,
    canGuest: true,
  },
  {
    labelKey: 'navigation.bookings',
    icon: {
      active: <GnbCalendarActive width="32px" height="32px" />,
      inactive: <GnbCalendarInactive width="32px" height="32px" />,
    },
    path: ROUTES.BOOKINGS,
    canGuest: false,
  },
  {
    labelKey: 'navigation.search',
    icon: {
      active: <GnbSearchActive width="32px" height="32px" />,
      inactive: <GnbSearchInactive width="32px" height="32px" />,
    },
    path: ROUTES.SEARCH,
    canGuest: true,
  },
  {
    labelKey: 'navigation.mypage',
    icon: {
      active: <GnbMypageActive width="32px" height="32px" />,
      inactive: <GnbMypageInactive width="32px" height="32px" />,
    },
    path: ROUTES.MYPAGE,
    canGuest: false,
  },
];
