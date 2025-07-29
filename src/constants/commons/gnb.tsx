import {
  GnbClinicActive,
  GnbClinicInactive,
  GnbHomeActive,
  GnbHomeInactive,
  GnbMyActive,
  GnbMyInactive,
  GnbPackageActive,
  GnbPackageInactive,
} from '@/icons';
import { ROUTES } from './routes';

export const MENUS = [
  {
    name: '홈',
    icon: {
      active: <GnbHomeActive width="32px" height="32px" />,
      inactive: <GnbHomeInactive width="32px" height="32px" />,
    },
    path: ROUTES.HOME,
    canGuest: true,
  },
  {
    name: '한의원',
    icon: {
      active: <GnbClinicActive width="32px" height="32px" />,
      inactive: <GnbClinicInactive width="32px" height="32px" />,
    },
    path: ROUTES.CLINICS,
    canGuest: false,
  },
  {
    name: '패키지',
    icon: {
      active: <GnbPackageActive width="32px" height="32px" />,
      inactive: <GnbPackageInactive width="32px" height="32px" />,
    },
    path: ROUTES.PACKAGES,
    canGuest: false,
  },
  {
    name: '마이',
    icon: {
      active: <GnbMyActive width="32px" height="32px" />,
      inactive: <GnbMyInactive width="32px" height="32px" />,
    },
    path: ROUTES.MYPAGE,
    canGuest: true,
  },
];
