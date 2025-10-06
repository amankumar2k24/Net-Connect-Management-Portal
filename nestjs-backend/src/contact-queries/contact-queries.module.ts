import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContactQueriesService } from './contact-queries.service';
import { ContactQueriesController } from './contact-queries.controller';
import { ContactQuery } from './entities/contact-query.entity';
import { EmailService } from '../common/services/email.service';

@Module({
    imports: [SequelizeModule.forFeature([ContactQuery])],
    controllers: [ContactQueriesController],
    providers: [ContactQueriesService, EmailService],
    exports: [ContactQueriesService],
})
export class ContactQueriesModule { }