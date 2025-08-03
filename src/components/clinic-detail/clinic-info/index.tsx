// import { useUserReservationGroomingListQuery } from '~/queries/reservation';
import { wrapper, url } from './index.styles';
import { ClinicLocation } from '@/icons/ClinicLocation';
import { Text } from '@/components/text';
import { ClinicClock, ClinicContact, ClinicGlobe } from '@/icons';
import { InfoRow } from '@/components/info-row';

interface Props {
  clinicAddress: string;
  clinicOpeningHours?: string[];
  clinicPhoneNumber?: string;
  clinicUrl?: string[];
}

export function ClinicInfo({
  clinicAddress,
  clinicOpeningHours,
  clinicPhoneNumber,
  clinicUrl,
}: Props) {
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
  );
}
