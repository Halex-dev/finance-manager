import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import Controllers from './controllers/index';
import Services from './services/index';
import Entities from './entities/index';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'storage/uploads'), // Serves static images from 'uploads' directory
      serveRoot: '/uploads', // Specifies the path to the URL from which the images will be served
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'front-end/dist'), // For front-end.js
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './storage/database/db.sqlite', // Path of SQLite file
      entities: Entities /* List of Entity for TypeORM*/,
      synchronize: true, // Attenzione: Remeber to put it false when after the production! //TODO mettilo false o perdi tabelle
      autoLoadEntities: true,
      keepConnectionAlive: true, // Attenzione: Remeber to put it false when after the production!
    }),
    TypeOrmModule.forFeature(Entities),
  ],
  controllers: Controllers,
  providers: Services,
})
export class AppModule {}
