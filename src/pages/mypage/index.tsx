import { AppBar, DesktopAppBar, GNB } from '@/components';
import { Layout } from '@/components/layout';
import { useRouter } from 'next/router';
import { Text } from '@/components/text';
import { ChevronRight, ChevronRightWhite, DefaultProfile } from '@/icons';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { ROUTES } from '@/constants';
import { useMediaQuery } from '@/hooks';
import { useGetUserProfileQuery } from '@/queries';
import { useEffect, useState } from 'react';
import { UserInfoForm } from '@/components/mypage/user-info-form';
import { SettingsForm } from '@/components/mypage/settings-form';

const menuItems = [
  { id: 'user-info', label: '내 정보 관리', route: ROUTES.MYPAGE_USER_INFO },
  { id: 'reservations', label: '예약내역', route: ROUTES.MYPAGE_RESERVATIONS },
  // { id: 'payments', label: '결제수단 관리', route: ROUTES.MYPAGE_PAYMENTS },
  { id: 'reviews', label: '내 리뷰', route: ROUTES.MYPAGE_REVIEWS },
  { id: 'settings', label: '설정', route: ROUTES.MYPAGE_SETTINGS },
  // { id: 'logout', label: '로그아웃' },
  // { id: 'withdraw', label: '회원탈퇴' },
  // { id: 'support', label: '계정설정' },
  { id: 'privacy', label: '서비스 개선' },
  { id: 'terms', label: '이용약관' },
] as const;

type MenuItem = (typeof menuItems)[number];

const detailTitleMap: Record<MenuItem['id'], string> = {
  'user-info': '내 정보',
  reservations: '예약내역',
  // payments: '결제수단 관리',
  reviews: '내 리뷰',
  settings: '설정',
  // logout: '로그아웃',
  // withdraw: '회원탈퇴',
  privacy: '서비스 개선',
  terms: '이용약관',
};

const hasRoute = (item?: MenuItem): item is MenuItem & { route: string } =>
  !!item && 'route' in item;

// 마이페이지
export default function MyPage() {
  const router = useRouter();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const { data: profileData } = useGetUserProfileQuery();
  const [activeMenu, setActiveMenu] = useState<MenuItem['id']>('user-info');
  const [searchValue, setSearchValue] = useState('');
  const user = profileData?.user;
  const tallyImproveUrl = 'https://tally.so/r/wkDMRj';
  const termsUrl = 'https://linen-sofa-f6f.notion.site/ebd//2958bf64ec2180b69375d5abbb8f8869';

  const handleClick = (path: string) => {
    router.push(path);
  };

  const handleSearch = () => {
    const query = searchValue.trim() ? `?q=${encodeURIComponent(searchValue)}` : '';
    router.push(`${ROUTES.SEARCH}${query}`);
  };

  const handleOpenTally = () => {
    if (typeof window !== 'undefined') {
      window.open(tallyImproveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenTerms = () => {
    if (typeof window !== 'undefined') {
      window.open(termsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const activeMenuItem = menuItems.find((item) => item.id === activeMenu);
  const activeRoute = hasRoute(activeMenuItem) ? activeMenuItem.route : null;

  useEffect(() => {
    if (!router.isReady) return;
    const tab = router.query.tab;
    if (typeof tab === 'string' && menuItems.some((item) => item.id === tab)) {
      setActiveMenu(tab as MenuItem['id']);
    }
  }, [router.isReady, router.query.tab]);

  const handleMenuSelect = (item: (typeof menuItems)[number]) => {
    setActiveMenu(item.id);
    if (isDesktop) {
      router.replace(
        {
          pathname: ROUTES.MYPAGE,
          query: { tab: item.id },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  if (isDesktop) {
    return (
      <Layout isAppBarExist={false}>
        <DesktopAppBar onSearchChange={setSearchValue} onSearch={handleSearch} />
        <section css={desktopPage}>
          <div css={desktopContainer}>
            <aside css={sidebar}>
              <div css={profileCard}>
                <div css={profileAvatar}>
                  {user?.profile_image_url ? (
                    <img src={user.profile_image_url} alt="Profile" css={profileImage} />
                  ) : (
                    <DefaultProfile width={72} height={72} />
                  )}
                </div>
                <Text typo="title_M" color="bg_default">
                  {user?.username || 'ONYU Member'}
                </Text>
                <button
                  type="button"
                  css={profileManageButton}
                  onClick={() => handleMenuSelect(menuItems[0])}
                >
                  <Text typo="body_S" color="bg_default">
                    내 정보 관리
                  </Text>
                  <ChevronRight width={12} height={12} />
                </button>
              </div>
              <div css={menuSection}>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    css={menuItem(item.id === activeMenu)}
                    onClick={() => handleMenuSelect(item)}
                  >
                    <Text
                      typo="body_M"
                      color={item.id === activeMenu ? 'primary50' : 'text_primary'}
                    >
                      {item.label}
                    </Text>
                  </button>
                ))}
              </div>
            </aside>
            <div css={detailPanel}>
              <div css={detailHeader}>
                <Text typo="title_M" color="text_primary">
                  {detailTitleMap[activeMenu]}
                </Text>
              </div>
              <div css={detailContent}>
                {activeMenu === 'user-info' ? (
                  <UserInfoForm variant="embedded" />
                ) : activeMenu === 'settings' ? (
                  <SettingsForm variant="embedded" />
                ) : activeMenu === 'privacy' ? (
                  <div css={detailCard}>
                    <div css={detailFrameWrap}>
                      <iframe
                        title="ONYU service improvement form"
                        src={tallyImproveUrl}
                        css={detailFrame}
                      />
                    </div>
                  </div>
                ) : activeMenu === 'terms' ? (
                  <div css={detailCard}>
                    <div css={detailFrameWrap}>
                      <iframe title="ONYU terms of use" src={termsUrl} css={detailFrame} />
                    </div>
                  </div>
                ) : (
                  <div css={detailCard}>
                    <Text typo="body_M" color="text_secondary">
                      선택한 메뉴의 상세 내용을 확인하세요.
                    </Text>
                    {activeRoute && (
                      <button
                        type="button"
                        css={detailAction}
                        onClick={() => handleClick(activeRoute)}
                      >
                        <Text typo="body_S" color="primary50">
                          상세 페이지 이동
                        </Text>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout isAppBarExist={false}>
      <AppBar onBackClick={router.back} logo="dark" backgroundColor="bg_surface1" />
      <section css={userSection}>
        <div css={userInfo}>
          <div css={userInfoImage}>
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt="프로필 이미지" width={50} height={50} />
            ) : (
              <DefaultProfile width={50} height={50} />
            )}
          </div>
          <div css={userInfoContent}>
            <div css={userInfoName}>
              <Text typo="title_M" color="text_primary">
                {user?.username || 'John Doe'}
              </Text>
            </div>
            <div css={userInfoDetail} onClick={() => handleClick(ROUTES.MYPAGE_USER_INFO)}>
              <Text typo="body_M" color="primary50">
                My Information
              </Text>
              <ChevronRight width={12} height={12} />
            </div>
          </div>
        </div>
        <div css={improvement} onClick={handleOpenTally}>
          <div css={improvementTitle}>
            <Text typo="body_L" color="bg_default">
              Help Improve ONYU
            </Text>
            <Text typo="body_M" color="bg_default">
              Help us refine your experience.
            </Text>
          </div>
          <div css={improvementButton}>
            <button type="button">
              <ChevronRightWhite width={12} height={12} />
            </button>
          </div>
        </div>
      </section>
      <section css={myServiceSection}>
        <div css={myServiceTitle}>
          <Text typo="body_M" color="text_primary">
            My Services
          </Text>
        </div>
        <div css={myServiceList}>
          <div css={myServiceItem} onClick={() => handleClick(ROUTES.MYPAGE_REVIEWS)}>
            <Text typo="body_S" color="primary50">
              Reviews{' '}
            </Text>
          </div>
          <div css={myServiceItem} onClick={() => handleClick(ROUTES.MYPAGE_SETTINGS)}>
            <Text typo="body_S" color="primary50">
              Settings
            </Text>
          </div>
        </div>
      </section>
      <div css={line} />
      <section css={myServiceSection}>
        <div css={myServiceTitle}>
          <Text typo="body_M" color="text_primary">
            Customer Support
          </Text>
        </div>
        <div css={myServiceList}>
          <div css={myServiceItem} onClick={handleOpenTerms}>
            <Text typo="body_S" color="primary50">
              Terms of Use
            </Text>
          </div>
        </div>
      </section>
      <GNB />
    </Layout>
  );
}

const userSection = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 30px;
  background-color: ${theme.colors.bg_surface1};
`;
const userInfo = css`
  display: flex;
  padding: 20px;
  gap: 24px;
  border-radius: 8px;
  background-color: ${theme.colors.bg_default};
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
`;
const userInfoImage = css`
  width: 50px;
  height: 50px;
  border-radius: 50px;
  background-color: ${theme.colors.gray100};
  object-fit: cover;
  overflow: hidden;
`;
const userInfoContent = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`;
const userInfoName = css``;
const userInfoDetail = css`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const improvement = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: ${theme.colors.primary50};
  border-radius: 8px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
`;
const improvementTitle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const improvementButton = css``;

const myServiceSection = css`
  display: flex;
  flex-direction: column;
`;
const myServiceTitle = css`
  padding: 8px 30px;
`;
const myServiceList = css`
  display: flex;
  flex-direction: column;
`;

const myServiceItem = css`
  padding: 24px 40px;
`;

const line = css`
  width: 100%;
  height: 3px;
  background-color: ${theme.colors.bg_surface1};
`;

const desktopPage = css`
  flex: 1;
  background: ${theme.colors.bg_surface1};
  padding: 32px 40px 48px;
`;

const desktopContainer = css`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const sidebar = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const profileCard = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  border-radius: 16px;
  background: linear-gradient(140deg, #7fc7d6 0%, #5b9fd6 48%, #4f79c4 100%);
  color: ${theme.colors.bg_default};
`;

const profileAvatar = css`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: ${theme.colors.whiteOpacity};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const profileImage = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const profileManageButton = css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: transparent;
  cursor: pointer;
`;

const menuSection = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  background: ${theme.colors.bg_default};
  border-radius: 16px;
  box-shadow: 0 0 12px ${theme.colors.grayOpacity50};
`;

const menuItem = (isActive: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: ${isActive ? theme.colors.primary10Opacity40 : 'transparent'};
  border: none;
  text-align: left;
  cursor: pointer;
`;

const detailPanel = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  background: ${theme.colors.bg_default};
  box-shadow: 0 0 12px ${theme.colors.grayOpacity50};
  min-height: 420px;
`;

const detailHeader = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const detailContent = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const detailCard = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const detailAction = css`
  align-self: flex-end;
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
`;

const detailFrameWrap = css`
  flex: 1;
  min-height: 480px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${theme.colors.gray100};
`;

const detailFrame = css`
  width: 111.12%;
  height: 111.12%;
  min-height: 611px;
  border: none;
  transform: scale(0.9);
  transform-origin: top left;
`;
