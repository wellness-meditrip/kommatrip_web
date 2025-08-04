// import { useUserReservationGroomingListQuery } from '~/queries/reservation';
import { wrapper, infoWrapper, url, contents, item } from './index.styles';
import { ClinicLocation } from '@/icons/ClinicLocation';
import { Text } from '@/components/text';
import {
  ClinicClock,
  ClinicContact,
  ClinicGlobe,
  ClinicLuggage,
  ClinicParking,
  ClinicPickup,
  ClinicPrivate,
  ClinicWifi,
} from '@/icons';
import { InfoRow } from '@/components/info-row';
import { CTAButton } from '@/components/button';
import { ClinicGoogleMap } from '@/components/map/google-map';
import { GoogleMapLoader } from '@/components/map/loader';
import { ClinicIntroduction } from '../clinic-introduction';

// interface Props {
//   clinicAddress: string;
//   clinicOpeningHours?: string[];
//   clinicPhoneNumber?: string;
//   clinicUrl?: string[];
// }

export function ClinicInfo() {
  //   {
  //   clinicAddress,
  //   clinicOpeningHours,
  //   clinicPhoneNumber,
  //   clinicUrl,
  // }: Props
  // const { data, isError } = useUserReservationGroomingListQuery();

  // if (isError) {
  //   open({
  //     title: '로그인 후 이용해 주세요',
  //     primaryActionLabel: '로그인 하기',
  //     onPrimaryAction: () => router.replace(ROUTES.LOGIN),
  //     secondaryActionLabel: '닫기',
  //   });
  //   router.back();
  // }

  // const reservations = data?.contents || [];

  const mockHours = [
    { day: '월요일', time: '오전 10:00 - 오후 7:00' },
    { day: '화요일', time: '오전 10:00 - 오후 7:00' },
    { day: '수요일', time: '오전 10:00 - 오후 7:00' },
    { day: '목요일', time: '오전 10:00 - 오후 5:00' },
    { day: '금요일', time: '오전 10:00 - 오후 7:00' },
    { day: '토요일', time: '오전 10:00 - 오후 5:30' },
    { day: '일요일', time: '휴무' },
  ];

  const mockAddress = {
    main: '대한민국 서울시 종로구 북촌 12길, 한옥 41',
    sub: '안국역 2번 출구에서 748m',
  };

  const mockPhone = '82+ 02-745-7511';

  const mockUrls = [
    'https://www.example.com',
    'https://instagram.com/example',
    'https://line.me/example',
    'https://youtube.com/example',
  ];

  return (
    <div css={wrapper}>
      <div css={infoWrapper}>
        <InfoRow
          icon={<ClinicLocation width={16} height={16} />}
          title={
            <Text typo="button_S" color="text_primary">
              {mockAddress.main}
            </Text>
          }
          expandable
          showToggleButton
        >
          <Text typo="button_S" color="text_primary">
            {mockAddress.sub}
          </Text>
        </InfoRow>

        <InfoRow
          icon={<ClinicClock width={16} height={16} />}
          title={
            <Text typo="button_S" color="text_primary">
              영업중 매주 일요일 휴무
            </Text>
          }
          expandable
          showToggleButton
        >
          {mockHours.map(({ day, time }) => (
            <Text key={day} typo="button_S" color="text_secondary">
              {day} {time}
            </Text>
          ))}
        </InfoRow>

        <InfoRow
          icon={<ClinicContact width={16} height={16} />}
          title={
            <Text typo="button_S" color="text_primary">
              {mockPhone}
            </Text>
          }
        />

        <InfoRow
          icon={<ClinicGlobe width={16} height={16} />}
          title={
            <Text typo="button_S" color="text_primary">
              Website www.example.com
            </Text>
          }
          expandable
          showToggleButton
        >
          <div css={url}>
            {mockUrls.map((url, i) => (
              <Text
                key={i}
                typo="button_S"
                color="text_primary"
                onClick={() => window.open(url, '_blank')}
              >
                {url.replace(/^https?:\/\/(www\.)?/, '').split('.')[0]}
              </Text>
            ))}
          </div>
        </InfoRow>
      </div>
      <div css={contents}>
        <ClinicIntroduction title="한의원 소개">
          <Text typo="body_M" color="text_primary">
            우주연 한의원은 &#39;몸을 존중하는 치료&#39;의 모토 아래 몸의 자연 회복 능력은 최대한
            살리며 근본적으로 몸을 도와주는 방법을 제시하는 한의원입니다. 몸과 마음은 물론 개인적인
            습관까지 들여다보며 만성질환을 겪고 있거나 양방으로만 치료하는데 다소 한계를 느낀 이들의
            근본적인 건강 개선에 초점을 맞추고 있습니다. 또한 체내외 밸런스를 조화롭게 정돈하는 것을
            중요시하며, 내장기와 근골격계 치료를 통해 이너뷰티를 실현하는 한방미용시술을 전문으로
            제공합니다.
          </Text>
        </ClinicIntroduction>
        <ClinicIntroduction title="편의시설" showToggle={false}>
          <div css={item}>
            <ClinicParking width={24} height={24} />
            <Text typo="body_S" color="text_tertiary">
              주차 가능
            </Text>
          </div>
          <div css={item}>
            <ClinicWifi width={24} height={24} />
            <Text typo="body_S" color="text_tertiary">
              무료 Wifi
            </Text>
          </div>
          <div css={item}>
            <ClinicLuggage width={24} height={24} />
            <Text typo="body_S" color="text_tertiary">
              짐 보관
            </Text>
          </div>
          <div css={item}>
            <ClinicPrivate width={24} height={24} />
            <Text typo="body_S" color="text_tertiary">
              프라이빗 진료
            </Text>
          </div>
          <div css={item}>
            <ClinicPickup width={24} height={24} />
            <Text typo="body_S" color="text_tertiary">
              공항 픽업
            </Text>
          </div>
        </ClinicIntroduction>

        <ClinicIntroduction title="지도" showToggle={false}>
          <GoogleMapLoader>
            <ClinicGoogleMap address={mockAddress.main} />
          </GoogleMapLoader>
        </ClinicIntroduction>
      </div>
      <CTAButton>예약하기</CTAButton>
    </div>
  );
}
