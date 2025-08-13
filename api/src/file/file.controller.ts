import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';

@Controller('files')
export class FileController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const type = req.query.type;
          let folder = 'uploads/others';

          if (type === 'user') folder = 'uploads/user-profile';
          else if (type === 'team') folder = 'uploads/team-image';
          else if (type === 'post') folder = 'uploads/post-image';

          cb(null, folder);
        },
        filename: (req, file: Express.Multer.File, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    let folder = 'others';
    if (type === 'user') folder = 'user-profile';
    else if (type === 'team') folder = 'team-image';
    else if (type === 'post') folder = 'post-image';

    const fileUrl = `${process.env.SERVER_URL}/uploads/${folder}/${file.filename}`;
    return { url: fileUrl };
  }
}
