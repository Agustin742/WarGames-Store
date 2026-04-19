import { Injectable, BadRequestException } from '@nestjs/common';
import cloudinary from './cloudinary.config';

type MulterFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

function isMulterFile(file: unknown): file is MulterFile {
  return (
    typeof file === 'object' &&
    file !== null &&
    'buffer' in file &&
    file['buffer'] instanceof Buffer
  );
}

@Injectable()
export class UploadsService {
  async uploadImage(file: unknown): Promise<{
    url: string;
    public_id: string;
  }> {
    if (!isMulterFile(file)) {
      throw new BadRequestException('Invalid file');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'wargames',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              return reject(new BadRequestException('Upload failed'));
            }

            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          },
        )
        .end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
