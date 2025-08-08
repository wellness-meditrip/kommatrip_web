import { ImageInput, Text } from '@/components';
import { wrapper, textareaContainer, textarea, textCount } from './index.styles';

interface MedicalInfoCardProps {
  symptoms: string;
  setSymptoms: (text: string) => void;
  medications: string;
  setMedications: (text: string) => void;
  selectedImages: File[];
  setSelectedImages: (images: File[]) => void;
}

export function MedicalInfoCard({
  symptoms,
  setSymptoms,
  medications,
  setMedications,
  selectedImages,
  setSelectedImages,
}: MedicalInfoCardProps) {
  const handleImageChange = (files: File[]) => {
    setSelectedImages(files);
  };

  return (
    <div css={wrapper}>
      <Text typo="title_M" color="text_primary">
        진료 정보
      </Text>

      <div css={textareaContainer}>
        <Text typo="title_S">주요 증상 및 진료 목적 *</Text>
        <textarea
          css={textarea}
          placeholder="진료 받고 싶은 증상이나 목적을 작성해주세요"
          maxLength={400}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <div css={textCount}>
          <span>{symptoms.length} / 400</span>
        </div>
      </div>

      <div css={textareaContainer}>
        <Text typo="title_S">복용 중인 약물</Text>
        <textarea
          css={textarea}
          placeholder="복용 중인 약물이 있다면 작성해주세요"
          maxLength={400}
          value={medications}
          onChange={(e) => setMedications(e.target.value)}
        />
        <div css={textCount}>
          <span>{medications.length} / 400</span>
        </div>
      </div>

      <div>
        <Text typo="title_S">첨부 사진</Text>
        <ImageInput maxLength={10} onChange={handleImageChange} defaultValue={selectedImages} />
      </div>
    </div>
  );
}
