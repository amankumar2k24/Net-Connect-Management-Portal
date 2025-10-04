import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AdminSettings } from './entities/admin-settings.entity';
import { UpdateAdminSettingsDto } from './dto/update-admin-settings.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(AdminSettings)
        private adminSettingsModel: typeof AdminSettings,
        private uploadsService: UploadsService,
    ) { }

    async getSettings() {
        let settings = await this.adminSettingsModel.findOne();

        if (!settings) {
            // Create default settings if none exist
            settings = await this.adminSettingsModel.create({
                qrCodeUrl: '',
                upiNumber: '',
            });
        }

        return { settings };
    }

    async updateSettings(updateAdminSettingsDto: UpdateAdminSettingsDto) {
        let settings = await this.adminSettingsModel.findOne();

        if (!settings) {
            settings = await this.adminSettingsModel.create(updateAdminSettingsDto);
        } else {
            await settings.update(updateAdminSettingsDto);
        }

        return { settings, message: 'Admin settings updated successfully' };
    }

    async uploadQrCode(file: Express.Multer.File) {
        // Upload the file
        const qrCodeUrl = await this.uploadsService.uploadQRCode(file);

        // Update the admin settings with the new QR code URL
        let settings = await this.adminSettingsModel.findOne();

        if (!settings) {
            settings = await this.adminSettingsModel.create({
                qrCodeUrl,
                upiNumber: '',
            });
        } else {
            await settings.update({ qrCodeUrl });
        }

        return {
            url: qrCodeUrl,
            settings,
            message: 'QR code uploaded and saved successfully'
        };
    }
}