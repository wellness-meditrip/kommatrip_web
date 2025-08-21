import { nanoid } from 'nanoid';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

interface Props {
  targetFolderPath: 'user/profile-images' | 'user/review-images' | 'user/reservation-images';
}

// 환경변수 검증
const region = process.env.NEXT_PUBLIC_AWS_REGION;
const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
const bucket = process.env.NEXT_PUBLIC_AWS_BUCKET;

if (!region || !accessKeyId || !secretAccessKey || !bucket) {
  console.error('AWS S3 환경변수가 설정되지 않았습니다:', {
    region: !!region,
    accessKeyId: !!accessKeyId,
    secretAccessKey: !!secretAccessKey,
    bucket: !!bucket,
  });
}

const s3 = new S3Client({
  region: region || 'ap-northeast-2', // Fallback region
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

// File을 Uint8Array로 변환하는 헬퍼 함수
const fileToUint8Array = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error('파일을 Uint8Array로 변환할 수 없습니다.'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

export function useS3({ targetFolderPath }: Props) {
  const uploadToS3 = async (files: File[]) => {
    if (!files.length) return [];

    // 환경변수 검증
    if (!region || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error('AWS S3 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
    }

    try {
      const uploadPromises = files.map(async (file) => {
        // 파일 크기 검증 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('파일 크기는 5MB를 초과할 수 없습니다.');
        }

        // 파일 타입 검증
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)');
        }

        const id = nanoid();
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${id}.${fileExtension}`;

        // File을 Uint8Array로 변환
        const uint8Array = await fileToUint8Array(file);

        const params = {
          Bucket: bucket,
          Key: `${targetFolderPath}/${fileName}`,
          Body: uint8Array,
          ContentType: file.type,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const url = `https://${bucket}.s3.${region}.amazonaws.com/${targetFolderPath}/${fileName}`;
        return url;
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('S3 업로드 에러:', error);
      throw new Error(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.');
    }
  };

  const deleteFromS3 = async (fileName: string) => {
    if (!bucket) {
      throw new Error('AWS S3 환경변수가 설정되지 않았습니다.');
    }

    try {
      const deleteParams = {
        Bucket: bucket,
        Key: `${targetFolderPath}/${fileName}`,
      };

      const command = new DeleteObjectCommand(deleteParams);
      await s3.send(command);
    } catch (error) {
      console.error('S3 삭제 에러:', error);
      throw new Error(error instanceof Error ? error.message : '이미지 삭제에 실패했습니다.');
    }
  };

  return { uploadToS3, deleteFromS3 };
}
