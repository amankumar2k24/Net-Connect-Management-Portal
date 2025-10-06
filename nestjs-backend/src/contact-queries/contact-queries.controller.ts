import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContactQueriesService } from './contact-queries.service';
import { CreateContactQueryDto } from './dto/create-contact-query.dto';
import { UpdateContactQueryDto } from './dto/update-contact-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ContactQueryStatus } from './entities/contact-query.entity';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Contact Queries')
@Controller('contact-queries')
export class ContactQueriesController {
    constructor(private readonly contactQueriesService: ContactQueriesService) { }

    @Post()
    @ApiOperation({ summary: 'Submit a new contact query' })
    @ApiResponse({ status: 201, description: 'Contact query submitted successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    create(@Body() createContactQueryDto: CreateContactQueryDto) {
        return this.contactQueriesService.create(createContactQueryDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all contact queries (Admin only)' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({ name: 'status', required: false, enum: ContactQueryStatus, description: 'Filter by status' })
    @ApiResponse({ status: 200, description: 'Contact queries retrieved successfully' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: ContactQueryStatus,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.contactQueriesService.findAll(pageNum, limitNum, status);
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get contact queries statistics (Admin only)' })
    @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
    getStats() {
        return this.contactQueriesService.getStats();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a specific contact query (Admin only)' })
    @ApiResponse({ status: 200, description: 'Contact query retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Contact query not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.contactQueriesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a contact query (Admin only)' })
    @ApiResponse({ status: 200, description: 'Contact query updated successfully' })
    @ApiResponse({ status: 404, description: 'Contact query not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateContactQueryDto: UpdateContactQueryDto,
    ) {
        return this.contactQueriesService.update(id, updateContactQueryDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a contact query (Admin only)' })
    @ApiResponse({ status: 200, description: 'Contact query deleted successfully' })
    @ApiResponse({ status: 404, description: 'Contact query not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.contactQueriesService.remove(id);
    }
}