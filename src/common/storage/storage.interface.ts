export interface StorageResult {
  url: string;
  key: string;
}

export interface StorageService {
  upload(file: Express.Multer.File): Promise<StorageResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
