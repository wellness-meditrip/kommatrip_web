import { forwardRef, ChangeEvent, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { ImageUploadPlus } from '@/icons';
import { useS3 } from '@/hooks/use-s3';
import { useToast } from '@/hooks/use-toast';
import {
  deleteImageButton,
  imageWrapper,
  thumbnailImage,
  uploadImageButton,
  wrapper,
} from './index.styles';

interface Props {
  onChange?: (urls: string[]) => void;
  defaultValue?: string[];
  maxLength?: number;
  targetFolderPath: 'user/profile-images' | 'user/review-images' | 'user/reservation-images';
}

export const ImageInput = forwardRef(
  ({ onChange, defaultValue = [], maxLength, targetFolderPath }: Props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [imageUrls, setImageUrls] = useState<string[]>(defaultValue);
    const [isUploading, setIsUploading] = useState(false);
    const { uploadToS3 } = useS3({ targetFolderPath });
    const { showToast } = useToast();

    useEffect(() => {
      if (defaultValue && defaultValue.length > 0) {
        setImageUrls(defaultValue);
      }
    }, [defaultValue]);

    useImperativeHandle(ref, () => ({
      getUrls: () => imageUrls,
    }));

    const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || isUploading) return;

      const uploadedImages = Array.from(e.target.files);
      const totalFiles = imageUrls.length + uploadedImages.length;

      if (maxLength && totalFiles > maxLength) {
        showToast({
          title: '최대 이미지 개수를 초과했습니다.',
          icon: 'exclaim',
        });
        return;
      }

      setIsUploading(true);

      try {
        const newUrls = await uploadToS3(uploadedImages);
        const updatedUrls = [...imageUrls, ...newUrls];

        setImageUrls(updatedUrls);
        onChange?.(updatedUrls);
        showToast({
          title: '이미지가 성공적으로 업로드되었습니다.',
          icon: 'check',
        });
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        showToast({
          title: error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.',
          icon: 'exclaim',
        });
      } finally {
        setIsUploading(false);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    };

    const handleRemoveImage = (index: number) => {
      const updatedUrls = imageUrls.filter((_, idx) => idx !== index);
      setImageUrls(updatedUrls);
      onChange?.(updatedUrls);
    };

    return (
      <div css={wrapper}>
        <label css={uploadImageButton} style={{ opacity: isUploading ? 0.5 : 1 }}>
          <ImageUploadPlus width="12px" height="12px" />
          <input
            type="file"
            accept="image/*"
            multiple
            ref={inputRef}
            onChange={handleFileInputChange}
            disabled={isUploading}
          />
        </label>

        {imageUrls.map((url, index) => (
          <div key={url + index} css={imageWrapper}>
            <button css={deleteImageButton} onClick={() => handleRemoveImage(index)}>
              <div />
            </button>
            <img src={url} alt={`이미지 ${index + 1}`} css={thumbnailImage} />
          </div>
        ))}

        {isUploading && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
            이미지 업로드 중...
          </div>
        )}
      </div>
    );
  }
);

ImageInput.displayName = 'ImageInput';
