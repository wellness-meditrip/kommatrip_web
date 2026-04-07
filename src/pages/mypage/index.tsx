import { AppBar, DesktopAppBar, GNB, SafeProfileImage } from '@/components';
import { Layout } from '@/components/layout';
import { Meta, createPageMeta } from '@/seo';
import { useRouter } from 'next/router';
import { Text } from '@/components/text';
import { ChevronRight, ChevronRightWhite, DefaultProfile } from '@/icons';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { ROUTES } from '@/constants';
import { useMediaQuery } from '@/hooks';
import { useGetUserProfileQuery } from '@/queries';
import { useEffect, useMemo, useState } from 'react';
import { UserInfoForm } from '@/components/mypage/user-info-form';
import { SettingsForm } from '@/components/mypage/settings-form';
import { useTranslations } from 'next-intl';
import { routing, type Locale } from '@/i18n/routing';
import { MyReviewsPanel } from '@/components/mypage/reviews-panel';
import { ReservationsPanel } from '@/components/mypage/reservations-panel';
import { getPrivateI18nServerSideProps } from '@/i18n/page-props';

type MenuItemConfig = {
  id: string;
  labelKey: string;
  detailTitleKey: string;
  route?: string;
};

const menuItemsConfig = [
  {
    id: 'user-info',
    labelKey: 'menu.userInfo',
    detailTitleKey: 'detail.userInfo',
    route: ROUTES.MYPAGE_USER_INFO,
  },
  {
    id: 'reservations',
    labelKey: 'menu.reservations',
    detailTitleKey: 'detail.reservations',
    route: ROUTES.MYPAGE_RESERVATIONS,
  },
  {
    id: 'reviews',
    labelKey: 'menu.reviews',
    detailTitleKey: 'detail.reviews',
    route: ROUTES.MYPAGE_REVIEWS,
  },
  {
    id: 'settings',
    labelKey: 'menu.settings',
    detailTitleKey: 'detail.settings',
    route: ROUTES.MYPAGE_SETTINGS,
  },
  {
    id: 'privacy',
    labelKey: 'menu.privacy',
    detailTitleKey: 'detail.privacy',
  },
  {
    id: 'terms',
    labelKey: 'menu.terms',
    detailTitleKey: 'detail.terms',
  },
] as const satisfies ReadonlyArray<MenuItemConfig>;

type MenuItemId = (typeof menuItemsConfig)[number]['id'];
type MenuItem = (typeof menuItemsConfig)[number] & { label: string; route?: string };

const hasRoute = (item?: MenuItem | null): item is MenuItem & { route: string } =>
  typeof item?.route === 'string';

// 마이페이지
export default function MyPage() {
  const router = useRouter();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const { data: profileData } = useGetUserProfileQuery();
  const t = useTranslations('mypage');
  const tCommon = useTranslations('common');
  const [activeMenu, setActiveMenu] = useState<MenuItemId>('user-info');
  const [searchValue, setSearchValue] = useState('');
  const user = profileData?.user;
  const tallyImproveUrl = 'https://tally.so/r/wkDMRj';
  const termsUrl = 'https://linen-sofa-f6f.notion.site/ebd//2958bf64ec2180b69375d5abbb8f8869';
  const currentLocale = useMemo<Locale>(() => {
    const pathLocale = router.asPath.split('/')[1];
    return routing.locales.includes(pathLocale as Locale)
      ? (pathLocale as Locale)
      : routing.defaultLocale;
  }, [router.asPath]);

  const menuItems = useMemo(
    () =>
      menuItemsConfig.map((item) => ({
        ...item,
        label: t(item.labelKey),
      })),
    [t]
  );

  const toLocalePath = (path: string) => `/${currentLocale}${path}`;

  const detailTitleMap = useMemo(
    () =>
      menuItemsConfig.reduce(
        (acc, item) => {
          acc[item.id] = t(item.detailTitleKey);
          return acc;
        },
        {} as Record<MenuItemId, string>
      ),
    [t]
  );

  const handleClick = (path: string) => {
    router.push(toLocalePath(path));
  };

  const handleSearch = () => {
    const query = searchValue.trim() ? `?q=${encodeURIComponent(searchValue)}` : '';
    router.push(`${toLocalePath(ROUTES.SEARCH)}${query}`);
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
    if (typeof tab === 'string' && menuItemsConfig.some((item) => item.id === tab)) {
      setActiveMenu(tab as MenuItemId);
    }
  }, [router.isReady, router.query.tab]);

  const handleMenuSelect = (item: MenuItem) => {
    setActiveMenu(item.id);
    if (isDesktop) {
      router.replace(
        {
          pathname: toLocalePath(ROUTES.MYPAGE),
          query: { tab: item.id },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  const meta = createPageMeta({
    pageTitle: t('title'),
    description: tCommon('app.description'),
    path: router.asPath || '/mypage',
    noindex: true,
  });

  if (isDesktop) {
    return (
      <>
        <Meta {...meta} />
        <Layout isAppBarExist={false} title={t('title')}>
          <div css={desktopAppBar}>
            <DesktopAppBar
              onSearchChange={setSearchValue}
              onSearch={handleSearch}
              showSearch={false}
            />
          </div>
          <div css={mobileAppBar}>
            <AppBar onBackClick={router.back} logo="dark" backgroundColor="bg_surface1" />
          </div>
          <section css={desktopPage}>
            <div css={desktopContainer}>
              <aside css={sidebar}>
                <div css={profileCard}>
                  <div css={profileAvatar}>
                    <SafeProfileImage
                      src={user?.profile_image_url}
                      alt={t('profile.imageAlt')}
                      css={profileImage}
                      fallback={<DefaultProfile width={72} height={72} />}
                    />
                  </div>
                  <Text typo="title_M" color="bg_default">
                    {user?.username || t('profile.fallbackName')}
                  </Text>
                  <button
                    type="button"
                    css={profileManageButton}
                    onClick={() => handleMenuSelect(menuItems[0])}
                  >
                    <Text typo="body_S" color="bg_default">
                      {t('profile.manage')}
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
                        typo="button_M"
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
                  ) : activeMenu === 'reservations' ? (
                    <ReservationsPanel variant="embedded" />
                  ) : activeMenu === 'reviews' ? (
                    <MyReviewsPanel variant="embedded" />
                  ) : activeMenu === 'privacy' ? (
                    <div css={detailCard}>
                      <div css={detailFrameWrap}>
                        <iframe
                          title={t('iframe.improvementTitle')}
                          src={tallyImproveUrl}
                          css={detailFrame}
                        />
                      </div>
                    </div>
                  ) : activeMenu === 'terms' ? (
                    <div css={detailCard}>
                      <div css={detailFrameWrap}>
                        <iframe title={t('iframe.termsTitle')} src={termsUrl} css={detailFrame} />
                      </div>
                    </div>
                  ) : (
                    <div css={detailCard}>
                      <Text typo="body_M" color="text_secondary">
                        {t('detail.description')}
                      </Text>
                      {activeRoute && (
                        <button
                          type="button"
                          css={detailAction}
                          onClick={() => handleClick(activeRoute)}
                        >
                          <Text typo="body_S" color="primary50">
                            {t('detail.goToPage')}
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
      </>
    );
  }

  return (
    <>
      <Meta {...meta} />
      <Layout isAppBarExist={false} title={t('title')}>
        <div css={desktopAppBar}>
          <DesktopAppBar
            onSearchChange={setSearchValue}
            onSearch={handleSearch}
            showSearch={false}
          />
        </div>
        <div css={mobileAppBar}>
          <AppBar onBackClick={router.back} logo="dark" backgroundColor="bg_surface1" />
        </div>
        <section css={userSection}>
          <div css={userInfo}>
            <div css={userInfoImage}>
              <SafeProfileImage
                src={user?.profile_image_url}
                alt={t('profile.imageAlt')}
                width={50}
                height={50}
                fallback={<DefaultProfile width={50} height={50} />}
              />
            </div>
            <div css={userInfoContent}>
              <div css={userInfoName}>
                <Text typo="title_M" color="text_primary">
                  {user?.username || t('profile.fallbackName')}
                </Text>
              </div>
              <div css={userInfoDetail} onClick={() => handleClick(ROUTES.MYPAGE_USER_INFO)}>
                <Text typo="body_M" color="primary50">
                  {t('profile.manage')}
                </Text>
                <ChevronRight width={12} height={12} />
              </div>
            </div>
          </div>
          <div css={improvement} onClick={handleOpenTally}>
            <div css={improvementTitle}>
              <Text typo="body_L" color="bg_default">
                {t('improvement.title')}
              </Text>
              <Text typo="body_M" color="bg_default">
                {t('improvement.subtitle')}
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
            <Text typo="title_S" color="text_primary">
              {t('sections.myServices')}
            </Text>
          </div>
          <div css={myServiceList}>
            <div css={myServiceItem} onClick={() => handleClick(ROUTES.MYPAGE_REVIEWS)}>
              <Text typo="body_M" color="primary50">
                {t('menu.reviews')}
              </Text>
            </div>
            <div css={myServiceItem} onClick={() => handleClick(ROUTES.MYPAGE_SETTINGS)}>
              <Text typo="body_M" color="primary50">
                {t('menu.settings')}
              </Text>
            </div>
          </div>
        </section>
        <div css={line} />
        <section css={myServiceSection}>
          <div css={myServiceTitle}>
            <Text typo="title_S" color="text_primary">
              {t('sections.support')}
            </Text>
          </div>
          <div css={myServiceList}>
            <div css={myServiceItem} onClick={handleOpenTerms}>
              <Text typo="body_M" color="primary50">
                {t('menu.terms')}
              </Text>
            </div>
          </div>
        </section>
        <GNB />
      </Layout>
    </>
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
  cursor: pointer;
`;

const improvement = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: ${theme.colors.primary50};
  border-radius: 8px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  cursor: pointer;
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
  padding: 24px 30px 24px;
`;
const myServiceList = css`
  display: flex;
  flex-direction: column;
`;

const myServiceItem = css`
  padding: 24px 40px 20px;
  cursor: pointer;
`;

const line = css`
  width: 100%;
  height: 3px;
  background-color: ${theme.colors.bg_surface1};
`;

const desktopAppBar = css`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: block;
  }
`;

const mobileAppBar = css`
  display: block;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: none;
  }
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

export const getServerSideProps = getPrivateI18nServerSideProps([
  'mypage',
  'review',
  'review-list',
]);
