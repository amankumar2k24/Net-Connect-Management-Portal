import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { NotificationStatus, NotificationType } from './entities/notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a notification (Admin only)' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all notifications with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: NotificationStatus })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('status') status?: NotificationStatus,
    @Query('type') type?: NotificationType,
  ) {
    return this.notificationsService.findAll(page, limit, userId, status, type);
  }

  @Get('my-notifications')
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMyNotifications(
    @GetUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.findUserNotifications(user.id, page, limit);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  markAllAsRead(@GetUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @GetUser() user: User,
  ) {
    return this.notificationsService.update(id, updateNotificationDto, user);
  }

  @Post(':id/mark-read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationsService.markAsRead(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationsService.remove(id, user);
  }
}