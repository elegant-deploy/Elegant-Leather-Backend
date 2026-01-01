import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockType } from './schemas/stock.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  async addStock(@Body() createStockDto: { type: StockType; name: string; quantity: number; unit?: string }, @Request() req) {
    const departmentId = req.user.role === UserRole.SUPER_ADMIN ? createStockDto['departmentId'] : req.user.departmentId;
    const stock = await this.stockService.addStock({ ...createStockDto, departmentId, addedBy: req.user.userId });
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'CREATE',
      resource: 'Stock',
      newValue: stock,
      details: `Added ${stock.type} stock ${stock.name}`,
      ipAddress: req.ip,
    });
    return stock;
  }

  @Get()
  findAll(@Request() req, @Query('type') type?: StockType) {
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return type ? this.stockService.findByType(type) : this.stockService.findAll();
    } else {
      return type ? this.stockService.findByType(type, req.user.departmentId) : this.stockService.findByDepartment(req.user.departmentId);
    }
  }

  @Patch(':id/quantity')
  async updateQuantity(@Param('id') id: string, @Body() updateDto: { quantity: number }, @Request() req) {
    const oldStock = await this.stockService.findOne(id);
    const updatedStock = await this.stockService.updateQuantity(id, updateDto.quantity);
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'UPDATE',
      resource: 'Stock',
      oldValue: oldStock,
      newValue: updatedStock,
      details: `Updated stock ${id} quantity to ${updateDto.quantity}`,
      ipAddress: req.ip,
    });
    return updatedStock;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const oldStock = await this.stockService.findOne(id);
    await this.stockService.remove(id);
    await this.auditLogsService.logAction({
      userId: req.user.userId,
      action: 'DELETE',
      resource: 'Stock',
      oldValue: oldStock,
      details: `Deleted stock ${id}`,
      ipAddress: req.ip,
    });
  }
}