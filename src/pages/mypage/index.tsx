import { AppBar, GNB } from '@/components';
import { Layout } from '@/components/layout';
import router from 'next/router';
import { Text } from '@/components/text';
import { ChevronRight, ChevronRightWhite } from '@/icons';
import { css } from '@emotion/react';
import { theme } from '@/styles';

// 마이페이지
export default function MyPage() {
  const user = {
    nickname: 'John Doe',
    email: 'john.doe@example.com',
    image: '/default.png',
  };
  return (
    <Layout isAppBarExist={false}>
      <AppBar
        onBackClick={router.back}
        leftButton={false}
        logo={true}
        backgroundColor="bg_surface1"
      />
      <section css={userSection}>
        <div css={userInfo}>
          <div css={userInfoImage}>
            <img src={user.image} alt="기본 이미지" width={50} height={50} />
          </div>
          <div css={userInfoContent}>
            <div css={userInfoName}>
              <Text typo="title_M" color="text_primary">
                {user.nickname}
              </Text>
            </div>
            <div css={userInfoDetail}>
              <Text typo="body_M" color="primary50">
                My Information
              </Text>
              <ChevronRight width={12} height={12} />
            </div>
          </div>
        </div>
        <div css={improvement}>
          <div css={improvementTitle}>
            <Text typo="body_L" color="bg_default">
              Help Improve ONYU
            </Text>
            <Text typo="body_M" color="bg_default">
              Help us refine your experience.
            </Text>
          </div>
          <div css={improvementButton}>
            <button>
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
          <div css={myServiceItem}>
            <Text typo="body_S" color="primary50">
              Reviews{' '}
            </Text>
          </div>
          <div css={myServiceItem}>
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
          <div css={myServiceItem}>
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
