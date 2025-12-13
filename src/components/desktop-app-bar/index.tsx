import { Logo, Globe, GlobeFilled, Login, LoginFilled } from '@/icons';
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
} from './index.styles';
import { SearchBar } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants';

interface DesktopAppBarProps {
  onSearchChange: (value: string) => void;
  onSearch?: () => void;
}

export function DesktopAppBar({ onSearchChange, onSearch }: DesktopAppBarProps) {
  const router = useRouter();

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  return (
    <div css={wrapper}>
      <div css={logo}>
        <Logo width="70px" height="30px" />
      </div>

      <div css={searchContainer}>
        <SearchBar
          onValueChange={onSearchChange}
          onSearch={onSearch}
          placeholder="Search spas, clinics, treatments..."
          isLeft={true}
        />
      </div>

      <div css={menuWrapper}>
        <ul css={menuList}>
          <li onClick={() => handleMenuClick(ROUTES.HOME)}>메인</li>
          <li onClick={() => handleMenuClick(ROUTES.COMPANY)}>웰니스 업체</li>
          <li onClick={() => handleMenuClick(ROUTES.MYPAGE)}>마이페이지</li>
          <li>비지니스 문의</li>
        </ul>
        <div css={logoutWrapper}>
          <div css={iconWrapper}>
            <div css={loginIcon}>
              <Login width="20px" height="20px" />
            </div>
            <div css={loginFilledIcon}>
              <LoginFilled width="20px" height="20px" />
            </div>
          </div>
          <Link href="/login">Login</Link>
        </div>
        <div css={languageWrapper}>
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
          <ul>
            <li>
              <Link href="/">한국어</Link>
            </li>
            <li>
              <Link href="/">English</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
