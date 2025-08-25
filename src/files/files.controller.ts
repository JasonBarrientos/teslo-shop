import { Controller, Post, Body, Param, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFilter } from './helpers/fileFilter.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file',{
    fileFilter: FileFilter
  }))
  uploadFile( @UploadedFile() file: Express.Multer.File){
    if(!file) throw new BadRequestException(`Make sure taht the file is a images`)
    return {
      fileName: file.originalname
    };
  }
}
