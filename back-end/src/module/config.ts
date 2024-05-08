import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
const defaultUploadPath = '/storage/uploads';
const defaultJSON = '/storage/database';

export const appConfig = {
  uploadPath: process.env.UPLOAD_PATH
    ? path.join(process.cwd(), process.env.UPLOAD_PATH)
    : path.join(process.cwd(), defaultUploadPath),
  defaultJSON: process.env.JSON_PATH
    ? path.join(process.cwd(), process.env.JSON_PATH)
    : path.join(process.cwd(), defaultJSON),
};
