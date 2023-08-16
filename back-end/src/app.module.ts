import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import Controllers from "./controllers/index"
import Services from "./services/index"
import Entities from "./entities/index"

// ----------------------------------- Vue.js -----------------------
import { ServeStaticModule} from '@nestjs/serve-static'; //For Vue.js
import { join } from 'path'; //For Vue.js

@Module({
  imports: [
    ServeStaticModule.forRoot({ 
      rootPath: join(__dirname, '../..', 'front-end/dist'), //For Vue.js
    }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database/db.sqlite', // Path of SQLite file
      entities: Entities, /* List of Entity for TypeORM*/
      synchronize: true, // Attenzione: Remeber to put it false when after the production! //TODO mettilo false o perdi tabelle
    }),
    TypeOrmModule.forFeature(Entities),
  ],
  controllers: Controllers,
  providers: Services,
})
export class AppModule {}
