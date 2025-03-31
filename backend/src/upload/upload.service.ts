import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    // Lấy các biến môi trường từ ConfigService
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    // Kiểm tra xem các biến môi trường có tồn tại không
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.',
      );
    }

    // Cấu hình Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadImage(file: Express.Multer.File, folderName: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const uploadResult = await this.uploadToCloudinary(file.buffer, folderName);
      return uploadResult.secure_url;
    } catch (error) {
      throw new BadRequestException('Failed to upload image: ' + error.message);
    }
  }

  private async uploadToCloudinary(fileBuffer: Buffer, folderName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
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