import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from './schemas/order.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: { title: string; description?: string }, @Request() req) {
    const order = await this.ordersService.create({ ...createOrderDto, createdBy: req.user.userId });
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'CREATE',
      resource: 'Order',
      newValue: order,
      details: `Created order ${order.title}`,
      ipAddress: req.ip,
    });
    return order;
  }

  @Get()
  findAll(@Request() req) {
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.ordersService.findAll();
    } else {
      return this.ordersService.findByDepartment(req.user.departmentId);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: { status: OrderStatus; reason?: string; nextDepartment?: string; machine?: string },
    @Request() req
  ) {
    const oldOrder = await this.ordersService.findOne(id);
    const updatedOrder = await this.ordersService.updateStatus(id, updateDto.status, updateDto.reason, updateDto.nextDepartment, updateDto.machine);
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'UPDATE',
      resource: 'Order',
      oldValue: oldOrder,
      newValue: updatedOrder,
      details: `Updated order ${id} status to ${updateDto.status}`,
      ipAddress: req.ip,
    });
    return updatedOrder;
  }

  @Patch(':id/assign')
  async assignToDepartment(@Param('id') id: string, @Body() assignDto: { departmentId: string; assignedTo: string }, @Request() req) {
    const oldOrder = await this.ordersService.findOne(id);
    const updatedOrder = await this.ordersService.assignToDepartment(id, assignDto.departmentId, assignDto.assignedTo);
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'UPDATE',
      resource: 'Order',
      oldValue: oldOrder,
      newValue: updatedOrder,
      details: `Assigned order ${id} to department ${assignDto.departmentId}`,
      ipAddress: req.ip,
    });
    return updatedOrder;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const oldOrder = await this.ordersService.findOne(id);
    await this.ordersService.remove(id);
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'DELETE',
      resource: 'Order',
      oldValue: oldOrder,
      details: `Deleted order ${id}`,
      ipAddress: req.ip,
    });
  }
}