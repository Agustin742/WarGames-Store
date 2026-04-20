import { BadRequestException } from '@nestjs/common';

type MulterLikeFile = {
  mimetype?: string;
};

export const imageFileFilter = (
  _req: unknown,
  file: unknown,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const f = file as MulterLikeFile;

  if (!f?.mimetype || !/^image\/(jpg|jpeg|png|webp)$/.test(f.mimetype)) {
    return callback(new BadRequestException('Only image files allowed'), false);
  }

  callback(null, true);
};
