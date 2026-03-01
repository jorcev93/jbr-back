import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { StorageService, StorageResult } from './storage.interface';

@Injectable()
export class CloudinaryStorageService implements StorageService {
  private readonly logger = new Logger(CloudinaryStorageService.name);
  private readonly folder: string;

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    this.folder = this.configService.get<string>('CLOUDINARY_FOLDER', 'jbre');
    this.logger.log('Cloudinary storage configurado correctamente');
  }

  async upload(file: Express.Multer.File): Promise<StorageResult> {
    return new Promise<StorageResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: this.folder,
          resource_type: 'image',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            this.logger.error('Error al subir a Cloudinary', error);
            reject(error || new Error('No se obtuvo resultado de Cloudinary'));
            return;
          }

          resolve({
            url: result.secure_url,
            key: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async delete(key: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(key);
    } catch (error) {
      this.logger.error(`Error al eliminar de Cloudinary: ${key}`, error);
      throw error;
    }
  }

  getUrl(key: string): string {
    return cloudinary.url(key, { secure: true });
  }
}
