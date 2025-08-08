import { forwardRef, ChangeEvent, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { ImageUploadPlus } from '@/icons';
import {
  deleteImageButton,
  imageWrapper,
  thumbnailImage,
  uploadImageButton,
  wrapper,
} from './index.styles';

interface Props {
  onChange?: (files: File[]) => void;
  defaultValue?: File[];
  maxLength?: number;
}

export const ImageInput = forwardRef(({ onChange, defaultValue = [], maxLength }: Props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<File[]>(defaultValue);
  const [files, setFiles] = useState<File[]>(defaultValue);

  useEffect(() => {
    if (defaultValue && defaultValue.length > 0) {
      filesRef.current = defaultValue;
      setFiles(defaultValue);
    }
  }, [defaultValue]);

  useImperativeHandle(ref, () => ({
    getFiles: () => filesRef.current,
  }));

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const uploadedImages = Array.from(e.target.files);
    const totalFiles = filesRef.current.length + uploadedImages.length;

    if (maxLength && totalFiles > maxLength) {
      return;
    }

    const updatedFiles = [...filesRef.current, ...uploadedImages];
    filesRef.current = updatedFiles;
    setFiles(updatedFiles);
    onChange?.(updatedFiles);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedFiles = filesRef.current.filter((_, idx) => idx !== index);

    filesRef.current = updatedFiles;

    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };

  return (
    <div css={wrapper}>
      <label css={uploadImageButton}>
        <ImageUploadPlus width="12px" height="12px" />
        <input
          type="file"
          accept="image/*"
          multiple
          ref={inputRef}
          onChange={handleFileInputChange}
        />
      </label>

      {files.map((file, index) => (
        <div key={file.name + index} css={imageWrapper}>
          <button css={deleteImageButton} onClick={() => handleRemoveImage(index)}>
            <div />
          </button>
          <img src={URL.createObjectURL(file)} alt={file.name} css={thumbnailImage} />
        </div>
      ))}
    </div>
  );
});

ImageInput.displayName = 'ImageInput';
