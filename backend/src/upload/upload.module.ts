import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { v2 as cloudinary } from 'cloudinary';

@Module({
  imports: [],
  providers: [
    UploadService,
    {
      provide: 'CLOUDINARY',
      useFactory: () => {
        return cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
      },
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}