import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs, constants as fsConstants } from 'fs';
import * as path from 'path';
import { appConfig } from '../../module/config';

@Injectable()
export class NotificationService {
  private readonly filePath = path.join(
    appConfig.defaultJSON,
    'notifications.json',
  );

  private async ensureFileExists(): Promise<void> {
    try {
      await fs.access(this.filePath, fsConstants.F_OK);
    } catch (error) {
      if (error.code === 'ENOENT') {
        const directory = path.dirname(this.filePath);
        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(this.filePath, '[]');
      } else {
        throw error;
      }
    }
  }

  async findAll(): Promise<any[]> {
    try {
      await this.ensureFileExists();
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading notifications:', error);
      return [];
    }
  }

  async create(notificationData: any): Promise<any> {
    try {
      const notifications = await this.findAll();
      const newNotification = {
        id: notifications.length + 1,
        ...notificationData,
      };
      notifications.push(newNotification);
      await fs.writeFile(this.filePath, JSON.stringify(notifications, null, 2));
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      let notifications = await this.findAll();
      notifications = notifications.filter(
        (notification) => notification.id !== id,
      );
      await fs.writeFile(this.filePath, JSON.stringify(notifications, null, 2));
    } catch (error) {
      console.error(`Error deleting notification with id ${id}:`, error);
      throw new NotFoundException(`Notification with id ${id} not found.`);
    }
  }
}
