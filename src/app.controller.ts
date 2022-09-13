import { Controller, Param, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { FileUploadParamsInterface } from './common/types/interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/:filename')
  async FileUpload(
    @Req() req: Request,
    @Res() res: Response,
    @Param() param: FileUploadParamsInterface,
  ) {
    const { filename } = param;
    return this.appService.uploadFile(req, res, filename);
  }
}
