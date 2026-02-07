import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

interface UploadedAsset {
    url: string;
    public_id: string;
}

@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadImage(file: Express.Multer.File): Promise<UploadedAsset> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'elegant-leather', resource_type: 'image' },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Upload failed'));
                    resolve({ url: result.secure_url, public_id: result.public_id });
                },
            );
            uploadStream.end(file.buffer);
        });
    }

    async uploadImageUrl(file: Express.Multer.File): Promise<string> {
        const result = await this.uploadImage(file);
        return result.url;
    }

    async uploadVideo(file: Express.Multer.File): Promise<UploadedAsset> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'elegant-leather',
                    resource_type: 'video',
                    max_file_size: 100000000, // 100MB limit
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Upload failed'));
                    resolve({ url: result.secure_url, public_id: result.public_id });
                },
            );
            uploadStream.end(file.buffer);
        });
    }

    async uploadMultipleImages(files: Express.Multer.File[]): Promise<UploadedAsset[]> {
        const promises = files.map(file => this.uploadImage(file));
        return Promise.all(promises);
    }

    async uploadMultipleImagesUrls(files: Express.Multer.File[]): Promise<string[]> {
        const results = await this.uploadMultipleImages(files);
        return results.map(r => r.url);
    }

    async uploadMultipleVideos(files: Express.Multer.File[]): Promise<UploadedAsset[]> {
        const promises = files.map(file => this.uploadVideo(file));
        return Promise.all(promises);
    }

    async deleteAsset(public_id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(public_id, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }
}