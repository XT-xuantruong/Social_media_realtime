import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(@Inject('CLOUDINARY') private cloudinary) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const uploadResult = await this.uploadToCloudinary(file.buffer);
      return uploadResult.secure_url;
    } catch (error) {
      throw new BadRequestException('Failed to upload image: ' + error.message);
    }
  }

  private async uploadToCloudinary(fileBuffer: Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'user_avatars',
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      const bufferStream = require('stream').Readable.from(fileBuffer);
      bufferStream.pipe(uploadStream);
    });
  }
}