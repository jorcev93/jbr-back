import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { StorageService, StorageResult } from './storage.interface';

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Asegurar que el directorio de uploads existe
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<StorageResult> {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, uniqueName);

    fs.writeFileSync(filePath, file.buffer);

    return {
      url: `/uploads/${uniqueName}`,
      key: uniqueName,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }
}
