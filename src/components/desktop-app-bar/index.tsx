import { Logo, Globe, Exit } from '@/icons';
import {
  wrapper,
  logo,
  searchContainer,
  menuWrapper,
  menuList,
  logoutWrapper,
  languageWrapper,
  languageIcon,
} from './index.styles';
import { SearchBar } from '@/components';
import Link from 'next/link';

interface DesktopAppBarProps {
  onSearchChange: (value: string) => void;
  onSearch?: () => void;
}

export function DesktopAppBar({ onSearchChange, onSearch }: DesktopAppBarProps) {
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
          <li>메인</li>
          <li>웰니스 업체</li>
          <li>마이페이지</li>
          <li>비지니스 문의</li>
        </ul>
        <div css={logoutWrapper}>
          <Exit width="20px" height="20px" />
          Logout
        </div>
        <div css={languageWrapper}>
          <div css={languageIcon}>
            <Globe width="20px" height="20px" />
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
