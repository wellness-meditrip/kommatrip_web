import Image from 'next/image';
import { useRouter } from 'next/router';
import { Tag, Text } from '@/components';
import { DefaultImage } from '@/icons';
import { ROUTES } from '@/constants/commons';
import { image, infoWrapper, top, wrapper } from './index.styles';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

interface Props {
  item: GroomerItem | VetItem;
}

interface GroomerItem {
  estimateId: number;
  groomerName: string;
  petName: string;
  petImageUrl: string;
  shopName: string;
  reservedDate: string;
}
export function ReservationsCard({ item }: Props) {
  const router = useRouter();
  return (
    <div
      css={wrapper}
      onClick={() =>
        router.push({
          pathname: ROUTES.RESERVATIONS_DETAIL(item.estimateId),
          query: { service: 'groomer' },
        })
      }
    >
      <div css={infoWrapper}>
        <div css={top}>
          <Text typo="subtitle1" color="black">
            {isGroomer(item) ? item.groomerName : item.vetName}
          </Text>

          <Tag variant="line">
            <Text typo="body2" color="blue200">
              {item.petName}
            </Text>
          </Tag>
        </div>

        {isGroomer(item) && (
          <Text typo="body11" color="gray400">
            {item.shopName}
          </Text>
        )}

        <Text typo="body12" color="gray600">
          {dayjs(item.reservedDate).locale('ko').format('YYYY.MM.DD(ddd) • HH:mm')}
        </Text>
      </div>

      {item.petImageUrl ? (
        <Image src={item.petImageUrl} alt="recipient" width={70} height={70} css={image} />
      ) : (
        <DefaultImage width={70} height={70} css={image} />
      )}
    </div>
  );
}
