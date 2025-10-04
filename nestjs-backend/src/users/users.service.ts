import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: UserRole,
    status?: UserStatus,
  ) {
    // Ensure page and limit are valid numbers
    const validPage = Math.max(1, Number(page) || 1);
    const validLimit = Math.max(1, Math.min(100, Number(limit) || 10));
    const offset = (validPage - 1) * validLimit;
    const where: any = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const { rows: users, count: total } = await this.userModel.findAndCountAll({
      where: {
        role: { [Op.ne]: UserRole.ADMIN },
      },
      limit: validLimit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      users,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<User> {
    const user = await this.findOne(id);

    // Only admins can update other users
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Regular users cannot change their role or status
    if (currentUser.role !== UserRole.ADMIN) {
      delete updateUserDto.role;
      delete updateUserDto.status;
    }

    // Ensure the email is in lowercase before updating
    if (updateUserDto.email) {
      updateUserDto.email = updateUserDto.email.toLowerCase();
    }

    await user.update(updateUserDto);
    return user;
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findOne(id);
    await user.update({ status });
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }

  async getDashboardStats() {
    const totalUsers = await this.userModel.count({
      where: {
        role: { [Op.ne]: UserRole.ADMIN },
      },
    });
    const activeUsers = await this.userModel.count({
      where: {
        status: UserStatus.ACTIVE,
        role: { [Op.ne]: UserRole.ADMIN },
      },
    });
    const inactiveUsers = await this.userModel.count({
      where: {
        status: UserStatus.INACTIVE,
        role: { [Op.ne]: UserRole.ADMIN },
      },
    });
    const suspendedUsers = await this.userModel.count({
      where: {
        status: UserStatus.SUSPENDED,
        role: { [Op.ne]: UserRole.ADMIN },
      },
    });

    const recentUsers = await this.userModel.findAll({
      where: {
        role: { [Op.ne]: UserRole.ADMIN },
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      recentUsers,
    };
  }
}