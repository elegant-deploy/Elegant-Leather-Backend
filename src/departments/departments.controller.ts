import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('departments')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  async create(@Body() createDepartmentDto: { name: string }, @Request() req) {
    const department = await this.departmentsService.create(createDepartmentDto.name, req.user.userId);
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'CREATE',
      resource: 'Department',
      newValue: department,
      details: `Created department ${department.name}`,
      ipAddress: req.ip,
    });
    return department;
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDepartmentDto: { name: string }, @Request() req) {
    const oldDepartment = await this.departmentsService.findOne(id);
    const updatedDepartment = await this.departmentsService.update(id, updateDepartmentDto.name);
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'UPDATE',
      resource: 'Department',
      oldValue: oldDepartment,
      newValue: updatedDepartment,
      details: `Updated department ${id}`,
      ipAddress: req.ip,
    });
    return updatedDepartment;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const oldDepartment = await this.departmentsService.findOne(id);
    await this.departmentsService.remove(id);
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'DELETE',
      resource: 'Department',
      oldValue: oldDepartment,
      details: `Deleted department ${id}`,
      ipAddress: req.ip,
    });
  }
}