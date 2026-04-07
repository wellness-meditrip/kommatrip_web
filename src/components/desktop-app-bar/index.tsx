import { useTranslations } from 'next-intl';

import {
  Globe,
  GlobeFilled,
  Login,
  LoginFilled,
  MypageActive,
  MypageInactive,
  KommaSpaceLogoWhite,
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
import { SearchBar } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants';
import { useChangeLocale, useCurrentLocale } from '@/i18n/navigation';
import { useState, useRef, useEffect } from 'react';
import { css } from '@emotion/react';
import type { Locale } from '@/i18n/routing';
import { useAuthState } from '@/hooks/auth/use-auth-state';
import { openLoginModal } from '@/utils/auth-modal';

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
  const { isAuthenticated } = useAuthState();
  const isLoggedIn = isAuthenticated;
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
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

  return (
    <div css={wrapper({ variant, sticky })}>
      <div
        css={logo}
        role="button"
        tabIndex={0}
        aria-label={tCommon('button.home')}
        onClick={() => handleMenuClick(ROUTES.HOME)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            handleMenuClick(ROUTES.HOME);
          }
        }}
      >
        <KommaSpaceLogoWhite width="90px" height="40px" />
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
          <li onClick={() => handleMenuClick(ROUTES.ARTICLES)}>{t('articles')}</li>
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
          {isLoggedIn ? (
            <Link href={ROUTES.MYPAGE}>{t('mypage')}</Link>
          ) : (
            <button
              type="button"
              css={authButton}
              onClick={() =>
                openLoginModal({
                  callbackUrl: router.asPath,
                  reason: 'header',
                })
              }
            >
              {t('login')}
            </button>
          )}
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
    </div>
  );
}

const authButton = css`
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
`;
