import { nanoid } from 'nanoid';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

interface Props {
  targetFolderPath:
    | 'user/profile-images'
    | 'user/review-images'
    | 'groomer/profile-images'
    | 'groomer/business-licenses'
    | 'groomer/licenses'
    | 'vet/profile-images'
    | 'vet/licenses';
}

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export function useS3({ targetFolderPath }: Props) {
  const uploadToS3 = async (files: File[]) => {
    if (!files.length) return;

    try {
      const uploadPromises = files.map(async (file) => {
        const id = nanoid();

        const params = {
          Bucket: process.env.AWS_BUCKET,
          Key: `${targetFolderPath}/${id}`,
          Body: file,
          ContentType: file.type,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const url = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${targetFolderPath}/${id}`;
        return url;
      });

      const urls = await Promise.all(uploadPromises);

      return urls;
    } catch (error) {
      throw new Error(String(error));
    }
  };

  const deleteFromS3 = async (fileName: string) => {
    try {
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET,
        Key: `${targetFolderPath}/${fileName}`,
      };

      const command = new DeleteObjectCommand(deleteParams);
      await s3.send(command);
    } catch (error) {
      throw new Error(String(error));
    }
  };

  return { uploadToS3, deleteFromS3 };
}
