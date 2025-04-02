import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  providers: [
    UploadService,
  ],
  exports: [UploadService],
})
export class UploadModule {}