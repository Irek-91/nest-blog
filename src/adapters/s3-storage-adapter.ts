import { PutBucketAclCommandOutput, PutObjectCommand, PutObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { log } from "console";

import { env } from 'process';
import sharp from "sharp";

export type filesResizingImages = {
    fileOriginal: {
        url: string
        fileId: string,
        size: number
    },
    fileMiddle: {
        url: string
        fileId: string,
        size: number
    },
    fileSmall: {
        url: string
        fileId: string,
        size: number
    }
}


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
            ContentType: file.mimetype
        });
        try {
            const uploadResult: PutObjectCommandOutput = await this.s3client.send(command)
            return {
                url: `https://blogger-platform.storage.yandexcloud.net/${key}`,
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
            ContentType: file.mimetype
        });
        try {
            const uploadResult: PutObjectCommandOutput = await this.s3client.send(command)
            return {
                url: `https://blogger-platform.storage.yandexcloud.net/${key}`,
                fileId: uploadResult.ETag
            }
        } catch (e) {
            return null
        }

    }

    async saveImageForPost(userId: string, postId: string, fileOriginal: Buffer,
        fileMiddle: Buffer, fileSmall: Buffer
    ): Promise<filesResizingImages | null> {
        const { format } = await sharp(fileOriginal).metadata();

        const keyOriginal = `users/blogs/${userId}/posts/${postId}/images/original/${userId}_image`
        const commandOriginal = new PutObjectCommand({
            Bucket: "blogger-platform",
            Key: keyOriginal,
            Body: fileOriginal,
            ContentType: format
        });
        const keyMiddle = `users/blogs/${userId}/posts/${postId}/images/middle/${userId}_image`
        const commandMiddle = new PutObjectCommand({
            Bucket: "blogger-platform",
            Key: keyMiddle,
            Body: fileMiddle,
            ContentType: format
        });

        const keySmall = `users/blogs/${userId}/posts/${postId}/images/small/${userId}_image`
        const commandSmall = new PutObjectCommand({
            Bucket: "blogger-platform",
            Key: keySmall,
            Body: fileSmall,
            ContentType: format
        });
        const sizeOriginal = (await sharp(fileOriginal).metadata()).size;
        const sizeMiddle = (await sharp(fileOriginal).metadata()).size;
        const sizeSmall = (await sharp(fileOriginal).metadata()).size;


        try {
            const uploadOroiginal: PutObjectCommandOutput = await this.s3client.send(commandOriginal)
            const uploadMiddle: PutObjectCommandOutput = await this.s3client.send(commandMiddle)
            const uploadSmall: PutObjectCommandOutput = await this.s3client.send(commandSmall)



            return {
                fileOriginal: {
                    url: `https://blogger-platform.storage.yandexcloud.net/${keyOriginal}`,
                    fileId: uploadOroiginal.ETag!,
                    size: sizeOriginal!
                },
                fileMiddle: {
                    url: `https://blogger-platform.storage.yandexcloud.net/${keyMiddle}`,
                    fileId: uploadMiddle.ETag!,
                    size: sizeMiddle!
                },
                fileSmall: {
                    url: `https://blogger-platform.storage.yandexcloud.net/${keySmall}`,
                    fileId: uploadSmall.ETag!,
                    size: sizeSmall!
                }
            }
        } catch (e) {
            return null
        }

    }


}


