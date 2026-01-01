import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { User, UserRole } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('users')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: { email: string; password: string; firstName: string; lastName: string; username: string; role: UserRole; departmentId: string }, @Request() req) {
    const user = await this.usersService.create(createUserDto);
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'CREATE',
      resource: 'User',
      newValue: { ...(user as any).toObject(), password: undefined },
      details: `Created user ${user.username}`,
      ipAddress: req.ip,
    });
    return user;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    const oldUser = await this.usersService.findById(id);
    if (!oldUser) throw new Error('User not found');
    const updatedUser = await this.usersService.update(id, updateUserDto);
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'UPDATE',
      resource: 'User',
      oldValue: { ...(oldUser as any).toObject(), password: undefined },
      newValue: { ...(updatedUser as any).toObject(), password: undefined },
      details: `Updated user ${id}`,
      ipAddress: req.ip,
    });
    return updatedUser;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const oldUser = await this.usersService.findById(id);
    if (!oldUser) throw new Error('User not found');
    await this.usersService.remove(id);
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'DELETE',
      resource: 'User',
      oldValue: { ...(oldUser as any).toObject(), password: undefined },
      details: `Deleted user ${id}`,
      ipAddress: req.ip,
    });
  }
} 