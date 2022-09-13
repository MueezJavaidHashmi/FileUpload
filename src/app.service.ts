import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { imageSizeEnum } from './common/types/enum';
import { defaultImageSize, errorMessages } from './common/types/constant';
import { resizeImage } from './helpers/helpers';
import { Request, Response } from 'express';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { ConfigServiceInterface } from './common/types/interface';
import { Sharp } from 'sharp';
import sizeOf from 'image-size';

@Injectable()
export class AppService {
  private S3: AWS.S3;
  private BUCKET: string;

  constructor(private configService: ConfigService<ConfigServiceInterface>) {
    this.S3 = new AWS.S3({
      accessKeyId: this.configService.get('ACCESS_KEY'),
      secretAccessKey: this.configService.get('SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
    this.BUCKET = this.configService.get('BUCKET_NAME');
  }

  async uploadFile(req: Request, res: Response, filename: string) {
    const fileSize = parseInt(req.headers['content-length']);
    const fileSizeLimit = this.configService.get('SIZE_LIMIT');
    const allowedExtensions = (
      this.configService.get('ALLOWED_EXTENSIONS') || ''
    ).split(',');
    const splitFileName = filename.split('.');
    const extension = splitFileName[splitFileName.length - 1];
    const contentType = req.headers['content-type'];
    const allowedContentTypes = (
      this.configService.get('ALLOWED_CONTENT_TYPES') || ''
    ).split(',');

    if (fileSize > fileSizeLimit) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessages.FILE_LIMIT_EXCEEDED,
      });
    }

    if (!allowedExtensions.includes(extension)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessages.EXTENSION_NOT_ALLOWED,
      });
    }

    if (!allowedContentTypes.includes(contentType)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessages.FILE_TYPE_NOT_ALLOWED,
      });
    }

    const filePath = path.join(__dirname, `/${filename}`);

    const stream = fs.createWriteStream(filePath);

    stream.on('open', () => {
      req.pipe(stream);
    });
    stream.on('drain', () => {
      const written = parseInt(String(stream.bytesWritten));
      const pWritten = ((written / fileSize) * 100).toFixed(2);
      console.log(`Processing  ...  ${pWritten}% done`);
    });
    stream.on('finish', async () => {
      const isImage = contentType.includes('image');
      let stream: Sharp | fs.ReadStream;

      if (isImage) {
        const allowedImageSize =
          imageSizeEnum[this.configService.get('IMAGE_SIZE')] || 2048;

        const dimensions = sizeOf(filePath);

        if (
          dimensions.height > allowedImageSize ||
          dimensions.width > allowedImageSize
        ) {
          fs.unlinkSync(filePath);
          return res.status(HttpStatus.BAD_REQUEST).send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: errorMessages.MAXIMUM_DIMENSION_EXCEEDED,
          });
        }

        const resizeSize = parseInt(
          this.configService.get('RESIZE_SIZE') || `${defaultImageSize}`,
        );

        stream = resizeImage(filePath, resizeSize);
      } else {
        stream = fs.createReadStream(filePath);
      }

      const uploadedImage = await this.S3.upload({
        Bucket: this.BUCKET,
        Key: `${filename}-${new Date().toISOString()}`,
        Body: stream,
      }).promise();

      fs.unlinkSync(filePath);

      res.status(200).send({ status: 'success', url: uploadedImage.Location });
    });
    stream.on('error', (error) => {
      console.log('error: ' + error);
      res.status(500).send({ status: 'error', error });
    });

    return true;
  }
}
