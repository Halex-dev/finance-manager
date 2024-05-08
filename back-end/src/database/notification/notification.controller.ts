// src/notification/notification.controller.ts

import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(): Promise<any[]> {
    return this.notificationService.findAll();
  }

  @Post()
  async create(@Body() notificationData: any): Promise<any> {
    return this.notificationService.create(notificationData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.notificationService.delete(+id);
  }
}
