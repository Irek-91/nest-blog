import { PutBucketAclCommandOutput, PutObjectCommand, PutObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { log } from "console";

import { env } from 'process';

@Injectable()

export class S3StorageAdapter {
    s3client: S3Client
    constructor() {
        const REGION = "ru-central1";
        // Установка эндпоинта Object Storage
        const ENDPOINT = "https://storage.yandexcloud.net";
        // Создание клиента для Object Storage
        this.s3client = new S3Client({
            region: REGION,
            endpoint: ENDPOINT,
            credentials: {
                secretAccessKey: 'YCMAKa3sVOEnu1KMPr0eTRUwFxhH1hVj68sd3y44',
                accessKeyId: 'YCAJEs-mGSQOtuSLohgGNFcK8'
            }
        });
    }
    
    async saveMainImageForBlog(userId: string, file: Express.Multer.File): Promise<{ url: string, fileId: any } | null> {
        const key = `users/blogs/${userId}/images/mains/${userId}_main`
        const command = new PutObjectCommand({
            Bucket: "blogger-platform",
            Key: key,
            Body: file.buffer,
            ContentType: 'image/png'
        });
        try {
            const uploadResult: PutObjectCommandOutput = await this.s3client.send(command)
            return {
                url: key,
                fileId: uploadResult.ETag
            }
        } catch (e) {
            return null
        }

    }

    async saveWallpaperImageForBlog(userId: string, file: Express.Multer.File): Promise<{ url: string, fileId: any } | null> {
        const key = `users/blogs/${userId}/images/wallpaper/${userId}_wallpaper`
        const command = new PutObjectCommand({
            Bucket: "blogger-platform",
            Key: key,
            Body: file.buffer,
            ContentType: 'image/png'
        });
        try {
            const uploadResult: PutObjectCommandOutput = await this.s3client.send(command)
            return {
                url: key,
                fileId: uploadResult.ETag
            }
        } catch (e) {
            return null
        }
       
    }

    async saveImageForPost(userId: string, postId: string, file: Express.Multer.File): Promise<{ url: string, fileId: any } | null> {
        const key = `users/blogs/${userId}/posts/${postId}/images/${userId}_image`
        const command = new PutObjectCommand({
            Bucket: "blogger-platform",
            Key: key,
            Body: file.buffer,
            ContentType: 'image/png'
        });
        try {
            const uploadResult: PutObjectCommandOutput = await this.s3client.send(command)
            return {
                url: key,
                fileId: uploadResult.ETag
            }
        } catch (e) {
            return null
        }
       
    }


}

