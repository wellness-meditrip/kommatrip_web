import { useTranslations } from 'next-intl';

import {
  Logo,
  Globe,
  GlobeFilled,
  Login,
  LoginFilled,
  MypageActive,
  MypageInactive,
} from '@/icons';
import {
  wrapper,
  logo,
  searchContainer,
  menuWrapper,
  menuList,
  logoutWrapper,
  languageWrapper,
  languageIcon,
  iconWrapper,
  loginIcon,
  loginFilledIcon,
  globeIcon,
  globeFilledIcon,
  languageDropdown,
  languageItem,
  languageItemActive,
} from './index.styles';
import { LoginModal, SearchBar } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants';
import { useChangeLocale, useCurrentLocale } from '@/i18n/navigation';
import { useState, useRef, useEffect } from 'react';
import type { Locale } from '@/i18n/routing';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/auth';

interface DesktopAppBarProps {
  onSearchChange: (value: string) => void;
  onSearch?: () => void;
  variant?: 'default' | 'transparent';
  showSearch?: boolean;
  sticky?: boolean;
  searchPlaceholder?: string;
  onSearchBarClick?: () => void;
}

const languages: { locale: Locale; label: string }[] = [
  { locale: 'ko', label: '한국어' },
  { locale: 'en', label: 'English' },
];

export function DesktopAppBar({
  onSearchChange,
  onSearch,
  variant = 'default',
  showSearch = true,
  sticky = true,
  searchPlaceholder,
  onSearchBarClick,
}: DesktopAppBarProps) {
  const t = useTranslations('header');
  const tCommon = useTranslations('common');

  const router = useRouter();
  const { status } = useSession();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthLoading = status === 'loading';
  const isLoggedIn = status === 'authenticated' || !!accessToken;
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const handleSearchBarClick = () => {
    if (onSearchBarClick) {
      onSearchBarClick();
      return;
    }
    if (onSearch) {
      onSearch();
      return;
    }
    router.push(ROUTES.SEARCH);
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  const handleLanguageChange = (locale: Locale) => {
    changeLocale(locale);
    setIsLanguageMenuOpen(false);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    if (isLanguageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageMenuOpen]);

  useEffect(() => {
    if (!router.isReady) return;

    const guestAccessiblePathnames = new Set([
      ROUTES.HOME,
      ROUTES.SEARCH,
      ROUTES.COMPANY,
      ROUTES.LOGIN,
      ROUTES.SIGNUP,
      ROUTES.TERMS_OF_USE,
      '/company/[companyId]',
      '/company/[companyId]/program',
    ]);

    if (isAuthLoading) return;

    if (isLoggedIn || guestAccessiblePathnames.has(router.pathname)) {
      setShowLoginModal(false);
      return;
    }

    setShowLoginModal(true);
  }, [isAuthLoading, isLoggedIn, router.isReady, router.pathname]);

  return (
    <div css={wrapper({ variant, sticky })}>
      <div
        css={logo}
        role="button"
        tabIndex={0}
        aria-label="Go to home"
        onClick={() => handleMenuClick(ROUTES.HOME)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            handleMenuClick(ROUTES.HOME);
          }
        }}
      >
        <Logo width="70px" height="30px" />
      </div>

      {showSearch && (
        <div css={searchContainer}>
          <SearchBar
            onValueChange={onSearchChange}
            onSearch={handleSearchBarClick}
            placeholder={searchPlaceholder ?? tCommon('home.searchPlaceholder')}
            isLeft={true}
            onInputClick={handleSearchBarClick}
            isReadOnly={true}
          />
        </div>
      )}

      <div css={menuWrapper}>
        <ul css={menuList}>
          <li onClick={() => handleMenuClick(ROUTES.HOME)}>{t('main')}</li>
          <li onClick={() => handleMenuClick(ROUTES.COMPANY)}>{t('programs')}</li>
          {/* <li onClick={() => handleMenuClick(ROUTES.MYPAGE)}>{t('mypage')}</li> */}
          <li
            onClick={() =>
              window.open(
                'https://docs.google.com/forms/d/e/1FAIpQLSe3ooadODaa3SwoF-ru6lXn82oXGSjBOhWZrcYiPuu8fMbGww/viewform',
                '_blank'
              )
            }
          >
            {t('business_inquiry')}
          </li>
        </ul>
        <div css={logoutWrapper}>
          <div css={iconWrapper}>
            <div css={loginIcon}>
              {isLoggedIn ? (
                <MypageInactive width="30px" height="30px" />
              ) : (
                <Login width="20px" height="20px" />
              )}
            </div>
            <div css={loginFilledIcon}>
              {isLoggedIn ? (
                <MypageActive width="30px" height="30px" />
              ) : (
                <LoginFilled width="20px" height="20px" />
              )}
            </div>
          </div>
          <Link href={isLoggedIn ? ROUTES.MYPAGE : ROUTES.LOGIN}>
            {isLoggedIn ? t('mypage') : t('login')}
          </Link>
        </div>
        <div
          css={languageWrapper}
          ref={languageMenuRef}
          onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
        >
          <div css={languageIcon}>
            <div css={iconWrapper}>
              <div css={globeIcon}>
                <Globe width="20px" height="20px" />
              </div>
              <div css={globeFilledIcon}>
                <GlobeFilled width="20px" height="20px" />
              </div>
            </div>
          </div>
          {isLanguageMenuOpen && (
            <ul css={languageDropdown}>
              {languages.map((lang) => (
                <li
                  key={lang.locale}
                  css={currentLocale === lang.locale ? languageItemActive : languageItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLanguageChange(lang.locale);
                  }}
                >
                  {lang.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
