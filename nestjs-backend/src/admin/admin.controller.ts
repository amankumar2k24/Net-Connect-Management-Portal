import {
    Controller,
    Get,
    Put,
    Body,
    UseGuards,
    Post,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AdminService } from './admin.service';
import { UpdateAdminSettingsDto } from './dto/update-admin-settings.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('settings')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get admin settings (Admin only)' })
    @ApiResponse({ status: 200, description: 'Admin settings retrieved successfully' })
    getSettings() {
        return this.adminService.getSettings();
    }

    @Put('settings')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update admin settings (Admin only)' })
    @ApiResponse({ status: 200, description: 'Admin settings updated successfully' })
    updateSettings(@Body() updateAdminSettingsDto: UpdateAdminSettingsDto) {
        return this.adminService.updateSettings(updateAdminSettingsDto);
    }

    @Post('qr-code')
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload and save QR code image (Admin only)' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'QR code uploaded and saved successfully' })
    async uploadQrCode(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        return this.adminService.uploadQrCode(file);
    }
}