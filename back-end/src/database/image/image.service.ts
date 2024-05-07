import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { logger } from 'src/module/logger';
import { appConfig } from '../../module/config';
import * as sharp from 'sharp';

@Injectable()
export class ImageService {
  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const fileName = uuidv4() + '.jpg';
      const filePath = path.join(appConfig.uploadPath, fileName);

      if (!fs.existsSync(appConfig.uploadPath)) {
        fs.mkdirSync(appConfig.uploadPath, { recursive: true });
      }

      await sharp(file.buffer)
        .resize({ width: 800, height: 600 }) // Dimensioni desiderate dell'immagine
        .jpeg({ quality: 60 }) // Comprime l'immagine PNG senza perdita di qualità
        .toFile(filePath);

      //await fs.promises.writeFile(filePath, file.buffer);

      return '/uploads/' + fileName;
    } catch (error) {
      logger.error(`Error to create the image: ${error}`);
      throw new Error("Errore durante il caricamento dell'immagine");
    }
  }

  async getImagePath(imageName: string): Promise<string | null> {
    const imagePath = path.join(appConfig.uploadPath, imageName);

    // Verifica se il file esiste
    if (fs.existsSync(imagePath)) {
      return imagePath;
    } else {
      return null;
    }
  }

  /*async deleteImage(imagePath: string): Promise<void> {
    try {
      const fullPath = path.join(appConfig.uploadPath, imagePath);

      if (!fs.existsSync(fullPath)) {
        throw new NotFoundException('Immagine non trovata');
      }

      await fs.promises.unlink(fullPath);
    } catch (error) {
      logger.error(`Error to delete the image: ${error}`);
      throw new Error('Error to delete the image');
    }
  }*/
}
