import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

export const appConfig = {
  uploadPath:
    path.join(process.cwd(), process.env.UPLOAD_PATH) ||
    path.join(process.cwd(), 'uploads'),
};
