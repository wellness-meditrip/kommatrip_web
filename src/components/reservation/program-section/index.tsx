import { useTranslations } from 'next-intl';
import { Text } from '@/components';
import { Chevron } from '@/icons';
import {
  chevronIcon,
  programCard,
  programImage,
  programInfo,
  sectionCard,
  sectionContent,
  sectionHeader,
} from './index.styles';

interface ProgramListItem {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  primary_image_url: string;
}

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  programs: ProgramListItem[];
  selectedProgramId: number | null;
  onSelectProgram: (programId: number) => void;
  formatDuration: (minutes?: number) => string;
  formatPrice: (price?: number) => string;
}

export function ProgramSection({
  isOpen,
  onToggle,
  programs,
  selectedProgramId,
  onSelectProgram,
  formatDuration,
  formatPrice,
}: Props) {
  const t = useTranslations('reservation');

  return (
    <div css={sectionCard}>
      <div css={sectionHeader} onClick={onToggle}>
        <Text typo="title_M" color="text_primary">
          {t('form.programs.title')}
        </Text>
        <div css={chevronIcon(isOpen)}>
          <Chevron width={24} height={24} />
        </div>
      </div>
      {isOpen && (
        <div css={sectionContent}>
          {programs.length === 0 && (
            <Text typo="body_S" color="text_tertiary">
              {t('form.programs.empty')}
            </Text>
          )}
          {programs.map((program) => (
            <div
              key={program.id}
              css={programCard(selectedProgramId === program.id)}
              onClick={() => onSelectProgram(program.id)}
            >
              <img
                src={program.primary_image_url || '/default.png'}
                alt={program.name}
                css={programImage}
              />
              <div css={programInfo}>
                <Text typo="title_S" color="text_primary">
                  {program.name}
                </Text>
                <Text typo="body_S" color="text_tertiary">
                  ⏱ {formatDuration(program.duration_minutes)} | {formatPrice(program.price)}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
