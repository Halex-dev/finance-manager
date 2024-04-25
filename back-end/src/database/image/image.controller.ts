import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return await this.imageService.uploadImage(file);
  }

  @Get(':imageName')
  async getImage(@Param('imageName') imageName: string): Promise<string> {
    try {
      const imagePath = await this.imageService.getImagePath(imageName);

      // Verifica se il percorso dell'immagine esiste
      if (!imagePath) {
        throw new NotFoundException('Immagine non trovata');
      }

      return imagePath;
    } catch (error) {
      throw new NotFoundException('Immagine non trovata');
    }
  }

  /*@Delete(':imageName')
  async deleteImage(@Param('imageName') imageName: string): Promise<void> {
    try {
      await this.imageService.deleteImage(imageName);
    } catch (error) {
      throw new NotFoundException('Immagine non trovata');
    }
  }*/
}
